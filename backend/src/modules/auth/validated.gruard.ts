import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma.service';

@Injectable()
export class ValidatedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { status: true },
    });
    if (user?.status !== 'VALIDATE') {
      throw new ForbiddenException('Compte non validé');
    }
    return true;
  }
}
