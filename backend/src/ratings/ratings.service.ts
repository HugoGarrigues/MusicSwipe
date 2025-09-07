import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { CreateRatingSpotifyDto } from './dto/create-rating-spotify.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateRatingDto) {
    const track = await this.prisma.track.findUnique({ where: { id: dto.trackId } });
    if (!track) {
      throw new NotFoundException(`Track with id ${dto.trackId} not found`);
    }

    // Upsert de la note (idempotent pour l'utilisateur et le track)
    return this.prisma.rating.upsert({
      where: { userId_trackId: { userId, trackId: dto.trackId } },
      create: { userId, trackId: dto.trackId, score: dto.score },
      update: { score: dto.score },
    });
  }

  /**
   * Upsert rating à partir d'un spotifyId, avec upsert préalable du Track.
   */
  async upsertBySpotify(userId: number, dto: CreateRatingSpotifyDto) {
    const track = await this.prisma.track.upsert({
      where: { spotifyId: dto.spotifyId },
      update: {
        title: dto.title ?? undefined,
        artistName: dto.artistName ?? undefined,
        albumName: dto.albumName ?? undefined,
        duration: dto.duration ?? undefined,
        previewUrl: dto.previewUrl ?? undefined,
      },
      create: {
        spotifyId: dto.spotifyId,
        title: dto.title || 'Unknown title',
        artistName: dto.artistName,
        albumName: dto.albumName,
        duration: dto.duration,
        previewUrl: dto.previewUrl,
      },
    });

    return this.prisma.rating.upsert({
      where: { userId_trackId: { userId, trackId: track.id } },
      create: { userId, trackId: track.id, score: dto.score },
      update: { score: dto.score },
    });
  }

  async findAll(params?: { userId?: number; trackId?: number }) {
    const where: any = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.trackId) where.trackId = params.trackId;
    return this.prisma.rating.findMany({ where });
  }

  async findOne(id: number) {
    const rating = await this.prisma.rating.findUnique({ where: { id } });
    if (!rating) throw new NotFoundException(`Rating with id ${id} not found`);
    return rating;
  }

  async update(id: number, userContext: { id: number; isAdmin?: boolean }, dto: UpdateRatingDto) {
    const existing = await this.prisma.rating.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Rating with id ${id} not found`);
    if (!userContext.isAdmin && existing.userId !== userContext.id) {
      throw new ForbiddenException('You cannot update a rating that is not yours');
    }
    return this.prisma.rating.update({ where: { id }, data: { score: dto.score } });
  }

  async remove(id: number, userContext: { id: number; isAdmin?: boolean }) {
    const existing = await this.prisma.rating.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Rating with id ${id} not found`);
    if (!userContext.isAdmin && existing.userId !== userContext.id) {
      throw new ForbiddenException('You cannot delete a rating that is not yours');
    }
    return this.prisma.rating.delete({ where: { id } });
  }

  

  async averageForTrack(trackId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException(`Track with id ${trackId} not found`);

    const agg = await this.prisma.rating.aggregate({
      where: { trackId },
      _avg: { score: true },
      _count: true,
    });
    return { trackId, average: agg._avg.score ?? 0, count: agg._count };
  }
}
