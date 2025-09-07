import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async likeTrack(userId: number, trackId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException(`Track with id ${trackId} not found`);

    const existing = await this.prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (existing) throw new ConflictException('Track already liked');

    return this.prisma.like.create({ data: { userId, trackId } });
  }

  async unlikeTrack(userId: number, trackId: number) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (!existing) throw new NotFoundException('Like not found');

    await this.prisma.like.delete({ where: { userId_trackId: { userId, trackId } } });
    return { message: 'Unliked' };
  }

  async myLikes(userId: number) {
    return this.prisma.like.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async isLiked(userId: number, trackId: number) {
    const like = await this.prisma.like.findUnique({ where: { userId_trackId: { userId, trackId } } });
    return { trackId, liked: !!like };
  }

  async countByTrack(trackId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException(`Track with id ${trackId} not found`);

    const count = await this.prisma.like.count({ where: { trackId } });
    return { trackId, count };
  }
}
