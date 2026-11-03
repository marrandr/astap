import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NewsWatchService } from './news-watch.service.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdminController],
  providers: [AdminService, NewsWatchService],
})
export class AdminModule {}
