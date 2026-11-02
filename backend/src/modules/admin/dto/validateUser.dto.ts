import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ValidateUserDto
{
	@IsString()
	@IsNotEmpty()
	id_user!:string
}
