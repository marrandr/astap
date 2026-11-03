import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../../prisma.service';
import { RelationType } from '../../generated/prisma/client';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    authorId: number,
    dto: CreatePostDto,
    parent?: { id: number; relationType: RelationType },
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
    });
    if (!topic) throw new NotFoundException('Thème introuvable');

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        location: dto.location,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        authorId,
        topicId: dto.topicId,
        parentPostId: parent?.id,
        relationType: parent?.relationType,
      },
    });
  }
  async findSimilar(q: string) {
    const term = q?.trim();
    if (!term || term.length < 3) return [];

    return this.prisma.post.findMany({
      where: {
        parentPostId: null,
        title: { contains: term, mode: 'insensitive' },
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        topic: { select: { id: true, label: true } },
      },
    });
  }

  async createReply(
    // <-- puis createReply, au même niveau
    authorId: number,
    parentId: number,
    dto: CreatePostDto,
    relationType: RelationType,
  ) {
    const parent = await this.prisma.post.findUnique({
      where: { id: parentId },
    });
    if (!parent) throw new NotFoundException('Post introuvable');
    if (parent.parentPostId !== null) {
      throw new BadRequestException("On ne répond qu'à un post original");
    }
    return this.create(authorId, dto, { id: parentId, relationType });
  }
}
