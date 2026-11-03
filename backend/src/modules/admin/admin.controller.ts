import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ValidateUserDto } from './dto/validateUser.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard.js';
import { AdminGuard } from '../../guards/roles.guard.js';
import { BootstrapAdminGuard } from '../../guards/bootstrap-admin.guard.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les comptes en attente de validation' })
  listPendingUsers() {
    return this.adminService.listPendingUsers();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Voir les informations d’un utilisateur et ses preuves d’identité' })
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserForReview(id);
  }

  @Patch('validate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Valider ou refuser un compte utilisateur' })
  validateUser(@Body() dto: ValidateUserDto) {
    return this.adminService.validateUser(dto);
  }

  @Post('create-admin')
  @UseGuards(BootstrapAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un compte administrateur (bootstrap libre si aucun admin, sinon réservé aux admins)',
  })
  @ApiBody({ type: CreateAdminDto })
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
}
