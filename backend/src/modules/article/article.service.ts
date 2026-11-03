import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { assertAllowedImage, type UploadedFile } from '../../common/uploads.js';
import type { Verdict, RelationType, EvidenceType } from '../../generated/prisma/enums.js';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles.dto';
import { VerifyArticleDto } from './dto/verify-article.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

interface UploadedArticleFiles {
  coverImage?: UploadedFile[];
  images?: UploadedFile[];
}

const authorSelect = {
  select: { id: true, name: true, email: true },
} as const;

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

    if (uploadedCover) {
      assertAllowedImage(uploadedCover);
    }
    uploadedImages.forEach(assertAllowedImage);

    let coverImageUrl = dto.coverImageUrl ?? null;
    if (uploadedCover) {
      const result = await this.cloudinary.uploadPublic(uploadedCover, 'article-covers');
      coverImageUrl = result.secure_url;
    }

    const galleryUrls: string[] = [...(dto.images ?? [])];

    for (const file of uploadedImages) {
      const result = await this.cloudinary.uploadPublic(file, 'article-images');
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
        relationType: dto.relationType ? (dto.relationType as RelationType) : null,
        images: galleryUrls.length > 0
          ? {
              create: galleryUrls.map((url) => ({
                fileUrl: url,
              })),
            }
          : undefined,
      },
      include: {
        author: authorSelect,
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
        author: authorSelect,
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

  async listArticles(query: ListArticlesQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.article.count(),
      this.prisma.article.findMany({
        skip,
        take: limit,
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
              comments: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
        verdict: dto.verdict as Verdict,
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
        type: dto.type as EvidenceType,
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

  async getTopics() {
    const topics = await this.prisma.topic.findMany({
      orderBy: { label: 'asc' },
      select: { id: true, label: true },
    });

    if (topics.length > 0) {
      return topics;
    }

    const defaults = ['Politique', 'Économie', 'Société', 'Santé', 'Éducation', 'Technologie', 'Environnement', 'Autre'];
    for (const label of defaults) {
      await this.prisma.topic.upsert({
        where: { label },
        update: {},
        create: { label },
      });
    }

    return this.prisma.topic.findMany({
      orderBy: { label: 'asc' },
      select: { id: true, label: true },
    });
  }
}
