import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ValidateUserDto } from './dto/validateUser.dto';

@Injectable()
export class AdminService {
	constructor(private readonly prisma:PrismaService){}
	async validateUser(dto:ValidateUserDto){
		try {
			
		} catch (error) {
			console.log(error)
		}
	}
}
