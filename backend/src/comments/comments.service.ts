import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateCommentDto) {
    const track = await this.prisma.track.findUnique({ where: { id: dto.trackId } });
    if (!track) throw new NotFoundException(`Track with id ${dto.trackId} not found`);

    return this.prisma.comment.create({
      data: { userId, trackId: dto.trackId, content: dto.content },
    });
  }

  async findAll(params?: { userId?: number; trackId?: number }) {
    const where: any = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.trackId) where.trackId = params.trackId;
    return this.prisma.comment.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException(`Comment with id ${id} not found`);
    return comment;
  }

  async update(id: number, userContext: { id: number; isAdmin?: boolean }, dto: UpdateCommentDto) {
    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Comment with id ${id} not found`);
    if (!userContext.isAdmin && existing.userId !== userContext.id) {
      throw new ForbiddenException('You cannot update a comment that is not yours');
    }
    return this.prisma.comment.update({ where: { id }, data: { content: dto.content } });
  }

  async remove(id: number, userContext: { id: number; isAdmin?: boolean }) {
    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Comment with id ${id} not found`);
    if (!userContext.isAdmin && existing.userId !== userContext.id) {
      throw new ForbiddenException('You cannot delete a comment that is not yours');
    }
    return this.prisma.comment.delete({ where: { id } });
  }
}

