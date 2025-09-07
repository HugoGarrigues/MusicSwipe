import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLikeSpotifyDto } from './dto/create-like-spotify.dto';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async likeTrack(userId: number, trackId: number) {
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException(`Track with id ${trackId} not found`);

    const existing = await this.prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (existing) return existing; // idempotent

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

  // ===== Spotify helpers (fallback si le client n'a pas l'id interne) =====
  async likeBySpotify(userId: number, dto: CreateLikeSpotifyDto) {
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

    const existing = await this.prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId: track.id } },
    });
    if (existing) return existing;
    return this.prisma.like.create({ data: { userId, trackId: track.id } });
  }

  async unlikeBySpotify(userId: number, spotifyId: string) {
    const track = await this.prisma.track.findUnique({ where: { spotifyId } });
    if (!track) throw new NotFoundException(`Track with spotifyId ${spotifyId} not found`);
    return this.unlikeTrack(userId, track.id);
  }

  async isLikedBySpotify(userId: number, spotifyId: string) {
    const track = await this.prisma.track.findUnique({ where: { spotifyId } });
    if (!track) return { spotifyId, liked: false };
    const like = await this.prisma.like.findUnique({ where: { userId_trackId: { userId, trackId: track.id } } });
    return { spotifyId, liked: !!like };
  }
}
