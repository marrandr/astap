import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class VerifyEmailDto {
@ApiProperty({example:"gmail"})
  @IsEmail()
  email!: string;
@ApiProperty({example:154})
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir 6 chiffres' })
  code!: string;
}
