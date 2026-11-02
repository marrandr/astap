import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto{
	@ApiProperty({example: "heramamo@gmail.com", description:"Email"})
	@IsEmail()
	email!:string

	@ApiProperty({example: "motdepasse123", description:"Mot de passe"})
	@IsString()
	password!:string
}
