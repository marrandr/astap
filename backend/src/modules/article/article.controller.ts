import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { VerifyArticleDto } from './dto/verify-article.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

interface UploadedArticleFiles {
  coverImage?: any[];
  images?: any[];
}

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Publier un article avec images facultatives' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Article à publier, avec option de fichiers image',
    schema: {
      type: 'object',
      required: ['title', 'content', 'topicId'],
      properties: {
        title: { type: 'string', example: 'Une information très importante' },
        content: { type: 'string', example: 'Voici le détail de l’information...' },
        topicId: { type: 'integer', example: 1 },
        location: { type: 'string', example: 'Paris', nullable: true },
        eventDate: { type: 'string', format: 'date-time', nullable: true },
        coverImageUrl: { type: 'string', example: 'https://example.com/cover.jpg', nullable: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Images de galerie de l’article',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Image de couverture de l’article',
        },
        parentArticleId: { type: 'integer', nullable: true },
        relationType: { type: 'string', enum: ['SUPPORTS', 'CONTRADICTS'], nullable: true },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverImage', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  create(
    @Req() req: any,
    @Body() dto: CreateArticleDto,
    @UploadedFiles() files: UploadedArticleFiles,
  ) {
    return this.articleService.createArticle(req.user.sub, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.articleService.listArticles();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Req() req: any, @Body() dto: VerifyArticleDto) {
    return this.articleService.verifyArticle(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('evidence')
  addEvidence(@Req() req: any, @Body() dto: CreateEvidenceDto) {
    return this.articleService.addEvidence(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/verifications')
  getVerifications(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleVerifications(id);
  }
}
