import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id/proofs')
  getProofs(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProofUrls(id);
  }
}
