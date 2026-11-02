import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Status = "PENDING" | "REFUSED" | "VALIDATE"
export class ValidateUserDto
{
	@IsString()
	@IsNotEmpty()
	@ApiProperty({example:1, description:"User ID"})
	id_user!:number

	@ApiProperty({example:"VALIDATE", description:"User new Status"})
	status!:Status
}
