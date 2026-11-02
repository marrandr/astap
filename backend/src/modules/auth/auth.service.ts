import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { UploadedProofs } from './auth.controller';
import { LoginDto } from './dto/login.dto';
import { use } from 'passport';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../prisma.service';
import { access } from 'node:fs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const CODE_TTL_MS = 10 * 60 * 1000;   // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute entre deux envois
const MAX_ATTEMPTS = 5;

const hashCode = (userId: number, code: string) =>
  createHash('sha256').update(`${userId}:${code}`).digest('hex');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly users: UsersService,
    private readonly cloudinary: CloudinaryService,
    private readonly jtwService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) { }

  async register(dto: RegisterDto, files: UploadedProofs) {
    const front = files?.front?.[0];
    const back = files?.back?.[0];

    if (!front || !back) {
      throw new BadRequestException('Le recto et le verso sont obligatoires');
    }
    if (![front, back].every((f) => ALLOWED_TYPES.includes(f.mimetype))) {
      throw new BadRequestException('Format accepté : JPEG ou PNG');
    }

    if (dto.mediaId !== undefined && dto.mediaId !== null) {
      const mediaExists = await this.prisma.media.findUnique({
        where: { id: dto.mediaId },
        select: { id: true },
      });

      if (!mediaExists) {
        throw new BadRequestException('Le média sélectionné est introuvable');
      }
    }

    const [frontRes, backRes] = await Promise.all([
      this.cloudinary.uploadPrivate(front),
      this.cloudinary.uploadPrivate(back),
    ]);

    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.users.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        mediaId: dto.mediaId ?? undefined,
        proofFrontUrl: frontRes.public_id,
        proofBackUrl: backRes.public_id,
      });
      await this.sendVerification(user);
      const payload = { sub: user.id, role: user.role }
      return {
        access_token: await this.jtwService.signAsync(payload),
        message: 'Compte créé. Un code à 6 chiffres vous a été envoyé par email. '
      };
    } catch (error) {
      await Promise.allSettled([
        this.cloudinary.delete(frontRes.public_id),
        this.cloudinary.delete(backRes.public_id),
      ]);
      throw error;
    }
  }

  async login(dto: LoginDto) {

    const user = await this.users.findByEmail(dto.email)
    if (!user)
      throw new NotFoundException("Utilisateur introuvable")
    const IsMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!IsMatch)
      throw new BadRequestException("Identifiant invalide")
    const payload = { sub: user.id, role: user.role }
    return {
      access_token: await this.jtwService.signAsync(payload)
    }

  }
  private async sendVerification(user: { id: number; email: string; name: string }) {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailCodeHash: hashCode(user.id, code),
        emailCodeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
        emailCodeSentAt: new Date(),
        emailCodeAttempts: 0,
      },
    });

    await this.mail.sendVerificationCode(user.email, user.name, code);
  }
  async verifyEmail(email: string, code: string) {
    const invalid = new BadRequestException('Code invalide ou expiré');
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.emailVerifiedAt ||
      !user.emailCodeHash ||
      !user.emailCodeExpiresAt ||
      user.emailCodeExpiresAt < new Date()
    ) {
      throw invalid;
    }

    const expected = Buffer.from(user.emailCodeHash, 'hex');
    const received = Buffer.from(hashCode(user.id, code), 'hex');
    const ok =
      expected.length === received.length && timingSafeEqual(expected, received);

    if (!ok) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailCodeAttempts: { increment: 1 } },
      });
      throw invalid;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailCodeHash: null,
        emailCodeExpiresAt: null,
        emailCodeSentAt: null,
        emailCodeAttempts: 0,
        verified: true,
      },
    });

    const payload = { sub: user.id, role: user.role };

    return {
      access_token: await this.jtwService.signAsync(payload),
      message: "Email vérifié. Votre compte attend la validation d'un administrateur.",
    };
  }
}
