import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ValidateUserDto } from './dto/validateUser.dto';

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	async createAdmin(dto: CreateAdminDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			throw new ConflictException('Un utilisateur avec cet email existe déjà');
		}

		const passwordHash = await bcrypt.hash(dto.password, 10);

		const admin = await this.prisma.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				passwordHash,
				role: 'ADMIN',
				status: 'VALIDATE',
				verified: true,
				reputation: 0,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				status: true,
				verified: true,
			},
		});

		return {
			message: 'Compte administrateur créé avec succès',
			admin,
		};
	}

	async validateUser(dto: ValidateUserDto) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id: dto.id_user } });
			if (!user)
				throw new NotFoundException('User not found');
			if (user.status === 'VALIDATE')
				throw new BadRequestException('User already validated');
			return this.prisma.user.update({ where: { id: dto.id_user }, data: { status: dto.status } });
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}
