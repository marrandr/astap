import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedProofs {
  front?: UploadedFile[];
  back?: UploadedFile[];
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un compte utilisateur avec pièces d’identité',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données du compte et les deux photos du document d’identité',
    schema: {
      type: 'object',
      required: ['name', 'email', 'password', 'front', 'back'],
      properties: {
        name: {
          type: 'string',
          example: 'Maitre Heramamo',
          description: 'Nom complet',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'heramamo@gmail.com',
          description: 'Adresse email',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'motdepasse123',
          description: 'Mot de passe',
        },
        mediaId: {
          type: 'integer',
          example: 1,
          description: 'ID du média, si applicable',
          nullable: true,
        },
        front: {
          type: 'string',
          format: 'binary',
          description: 'Photo recto du document d’identité',
        },
        back: {
          type: 'string',
          format: 'binary',
          description: 'Photo verso du document d’identité',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  register(@Body() dto: RegisterDto, @UploadedFiles() files: UploadedProofs) {
    return this.auth.register(dto, files);
  }
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.email, dto.code);
  }
}
