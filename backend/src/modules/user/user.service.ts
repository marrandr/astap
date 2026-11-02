import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    lastName: string;
    firstName: string;
    email: string;
    passwordHash: string;
    mediaId?: number;
  }) {
    try {
      return await this.prisma.user.create({
        data,
        select: {
          id: true,
          lastName: true,
          firstName: true,
          email: true,
          role: true,
          status: true,
          mediaId: true,
          registeredAt: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002')
          throw new ConflictException('Cet email est déjà utilisé.');
        if (e.code === 'P2003')
          throw new BadRequestException('Média introuvable.');
      }
      throw e;
    }
  }
}
