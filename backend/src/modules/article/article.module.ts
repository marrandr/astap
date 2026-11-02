import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService, CloudinaryService],
})
export class ArticleModule {}
