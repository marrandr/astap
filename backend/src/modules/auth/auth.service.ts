import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { UploadedProofs } from './auth.controller';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async register(dto: RegisterDto, files: UploadedProofs) {
    const front = files?.front?.[0];
    const back = files?.back?.[0];

    if (!front || !back) {
      throw new BadRequestException('Le recto et le verso sont obligatoires');
    }
    if (![front, back].every((f) => ALLOWED_TYPES.includes(f.mimetype))) {
      throw new BadRequestException('Format accepté : JPEG ou PNG');
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
        mediaId: dto.mediaId,
      });

      return {
        message:
          'Compte créé. Il sera actif après validation par un administrateur.',
        user,
      };
    } catch (error) {
      await Promise.allSettled([
        this.cloudinary.delete(frontRes.public_id),
        this.cloudinary.delete(backRes.public_id),
      ]);
      throw error;
    }
  }
}
