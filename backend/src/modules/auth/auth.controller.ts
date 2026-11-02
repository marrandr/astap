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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } }, // 5 Mo
    ),
  )
  register(@Body() dto: RegisterDto, @UploadedFiles() files: UploadedProofs) {
    return this.auth.register(dto, files);
  }
  @Post('login')
  async login(@Body() dto:LoginDto){
    return this.auth.login(dto)
  }
}
