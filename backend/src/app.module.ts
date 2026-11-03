import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { PostsService } from './modules/posts/posts.service';
import { PostsController } from './modules/posts/posts.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, PostsController],
  providers: [AppService, PrismaService, PostsService],
  exports: [PrismaService],
})
export class AppModule {}
