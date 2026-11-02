import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { VerifyArticleDto } from './dto/verify-article.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

interface UploadedArticleFiles {
  coverImage?: any[];
  images?: any[];
}

@Injectable()
export class ArticleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createArticle(userId: number, dto: CreateArticleDto, files?: UploadedArticleFiles) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
      select: { id: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic introuvable');
    }

    if (dto.parentArticleId) {
      const parent = await this.prisma.article.findUnique({
        where: { id: dto.parentArticleId },
        select: { id: true },
      });

      if (!parent) {
        throw new NotFoundException('Article parent introuvable');
      }
    }

    const uploadedCover = files?.coverImage?.[0];
    const uploadedImages = files?.images ?? [];

    let coverImageUrl = dto.coverImageUrl ?? null;
    if (uploadedCover) {
      const result = await this.cloudinary.uploadPrivate(uploadedCover, 'article-covers');
      coverImageUrl = result.secure_url;
    }

    const galleryUrls: string[] = [...(dto.images ?? [])];

    for (const file of uploadedImages) {
      const result = await this.cloudinary.uploadPrivate(file, 'article-images');
      galleryUrls.push(result.secure_url);
    }

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        location: dto.location,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        coverImageUrl,
        authorId: userId,
        topicId: dto.topicId,
        parentArticleId: dto.parentArticleId ?? null,
        relationType: dto.relationType ? (dto.relationType as any) : null,
        images: galleryUrls.length > 0
          ? {
              create: galleryUrls.map((url) => ({
                fileUrl: url,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        topic: true,
        images: true,
      },
    });

    return {
      message: 'Article publié avec succès',
      article,
    };
  }

  async getArticleById(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        topic: true,
        verifications: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        evidences: true,
        images: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article introuvable');
    }

    return article;
  }

  async listArticles() {
    return this.prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
        topic: true,
        _count: {
          select: {
            verifications: true,
            evidences: true,
          },
        },
      },
    });
  }

  async verifyArticle(userId: number, dto: VerifyArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article introuvable');
    }

    const existing = await this.prisma.verification.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: dto.articleId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Vous avez déjà vérifié cet article');
    }

    const verification = await this.prisma.verification.create({
      data: {
        userId,
        articleId: dto.articleId,
        verdict: dto.verdict as any,
        justification: dto.justification,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'Vérification enregistrée',
      verification,
    };
  }

  async addEvidence(userId: number, dto: CreateEvidenceDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article introuvable');
    }

    if (!dto.url && !dto.file) {
      throw new BadRequestException('Une URL ou un fichier est requis');
    }

    const evidence = await this.prisma.evidence.create({
      data: {
        userId,
        articleId: dto.articleId,
        type: dto.type as any,
        url: dto.url ?? null,
        file: dto.file ?? null,
        description: dto.description ?? null,
      },
    });

    return {
      message: 'Preuve ajoutée',
      evidence,
    };
  }

  async getArticleVerifications(articleId: number) {
    return this.prisma.verification.findMany({
      where: { articleId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { verifiedAt: 'desc' },
    });
  }
}
