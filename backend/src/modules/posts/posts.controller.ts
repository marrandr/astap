import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { ValidatedGuard } from '../auth/validated.gruard';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { RelationType } from '../../generated/prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, ValidatedGuard)
  @Get('similar')
  similar(@Query('q') q: string) {
    return this.postsService.findSimilar(q);
  }
  @UseGuards(JwtAuthGuard, ValidatedGuard)
  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }
  @Post(':id/sub-posts')
  subPost(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.createReply(
      user.id,
      id,
      dto,
      RelationType.SUPPORTS,
    );
  }

  @Post(':id/anti-posts')
  antiPost(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.createReply(
      user.id,
      id,
      dto,
      RelationType.CONTRADICTS,
    );
  }
}
