import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ValidateUserDto } from './dto/validateUser.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Patch("validate")
  async validateUser(@Body() dto:ValidateUserDto){
    return this.adminService.validateUser(dto)
  }
  @Post("create-admin")
  async createAdmin(){

  }
}
