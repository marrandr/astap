import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ValidateUserDto } from './dto/validateUser.dto';

@Injectable()
export class AdminService {
	constructor(private readonly prisma:PrismaService){}
	async validateUser(dto:ValidateUserDto){
		try {
			const user =await this.prisma.user.findUnique({where:{id:dto.id_user}})
			if (!user)
				throw new NotFoundException("User not found")
			if (user.status == "VALIDATE")
				throw new BadRequestException("User already validated")
			return this.prisma.user.update({where:{id:dto.id_user},data:{status:dto.status}})
		} catch (error) {
			console.log(error)
		}
	}
}
