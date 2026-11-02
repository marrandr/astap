import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      email: dto.email,
      passwordHash,
      mediaId: dto.mediaId,
    });
    return {
      message:
        'Compte créé. Il sera actif après validation par un administrateur.',
      user,
    };
  }
}
