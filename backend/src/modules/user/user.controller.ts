import { Controller } from '@nestjs/common';
import { UserService } from './user.service.ts';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
