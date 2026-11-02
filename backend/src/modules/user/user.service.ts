import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    mediaId?: number;
    proofFrontUrl: string;
    proofBackUrl: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        mediaId: data.mediaId,
        proofFrontUrl: data.proofFrontUrl,
        proofBackUrl: data.proofBackUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        mediaId: true,
      },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        mediaId: true,
        proofFrontUrl: true,
        proofBackUrl: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      proofFrontUrl: user.proofFrontUrl
        ? this.cloudinary.getSignedUrl(user.proofFrontUrl)
        : null,
      proofBackUrl: user.proofBackUrl
        ? this.cloudinary.getSignedUrl(user.proofBackUrl)
        : null,
    };
  }

  async getProofUrls(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    return {
      id: user.id,
      proofFrontUrl: user.proofFrontUrl,
      proofBackUrl: user.proofBackUrl,
    };
  }
}
