import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ValidateUserDto } from './dto/validateUser.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('validate')
  async validateUser(@Body() dto: ValidateUserDto) {
    return this.adminService.validateUser(dto);
  }

  @Post('create-admin')
  @ApiOperation({ summary: 'Créer un compte administrateur' })
  @ApiBody({ type: CreateAdminDto })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
}
