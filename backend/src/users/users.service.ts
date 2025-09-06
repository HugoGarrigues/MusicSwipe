import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TargetType } from '@prisma/client';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SpotifyService } from 'src/auth/spotify.service';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private spotify: SpotifyService) {}

   async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }
        if (error.meta?.target?.includes('username')) {
          throw new ConflictException('Un utilisateur avec ce nom d\'utilisateur existe déjà');
        }
        throw new ConflictException('Un utilisateur avec ces informations existe déjà');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }


  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw e;
    }
  }

  /**
   * Tracks récents de l'utilisateur (basés sur l'activité: like/rate/comment)
   */
  async getRecentTracks(userId: number, take = 20) {
    // 1) Récupère les credentials Spotify liés à l'utilisateur
    const oauth = await this.prisma.userOAuth.findFirst({
      where: { userId, provider: 'spotify' },
    });
    if (!oauth) {
      throw new BadRequestException('Aucun compte Spotify lié. Veuillez lier votre compte.');
    }

    let accessToken = oauth.accessToken;
    const now = new Date();
    if (!accessToken) {
      // pas de token, on tente un refresh si possible
      if (!oauth.refreshToken) throw new UnauthorizedException('Token Spotify manquant');
      const refreshed = await this.spotify.refreshToken(oauth.refreshToken);
      await this.prisma.userOAuth.update({
        where: { id: oauth.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? oauth.refreshToken,
          tokenExpires: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000)
            : oauth.tokenExpires,
        },
      });
      accessToken = refreshed.access_token;
    } else if (oauth.tokenExpires && oauth.tokenExpires <= now) {
      // token expiré, refresh
      if (!oauth.refreshToken) throw new UnauthorizedException('Token Spotify expiré');
      const refreshed = await this.spotify.refreshToken(oauth.refreshToken);
      await this.prisma.userOAuth.update({
        where: { id: oauth.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? oauth.refreshToken,
          tokenExpires: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000)
            : oauth.tokenExpires,
        },
      });
      accessToken = refreshed.access_token;
    }

    // 2) Appelle Spotify Recently Played
    const { items } = await this.spotify.getRecentlyPlayed(accessToken!, Math.min(Math.max(take, 1), 50));

    // 3) Transforme et déduplique (par track id Spotify)
    const seenSpotifyIds = new Set<string>();
    const ordered = [] as {
      spotifyId: string;
      title: string;
      artistName?: string;
      albumName?: string;
      duration?: number;
      previewUrl?: string;
    }[];

    for (const it of items) {
      const t = it.track;
      if (!t?.id) continue;
      if (seenSpotifyIds.has(t.id)) continue;
      seenSpotifyIds.add(t.id);
      ordered.push({
        spotifyId: t.id,
        title: t.name,
        artistName: t.artists?.map((a) => a.name).join(', '),
        albumName: t.album?.name,
        duration: t.duration_ms ? Math.round(t.duration_ms / 1000) : undefined,
        previewUrl: t.preview_url ?? undefined,
      });
      if (ordered.length >= take) break;
    }

    if (!ordered.length) return [];

    // 4) Upsert dans la table Track pour cohérence de type et réutilisation côté app
    await Promise.all(
      ordered.map((data) =>
        this.prisma.track.upsert({
          where: { spotifyId: data.spotifyId },
          update: {
            title: data.title,
            artistName: data.artistName,
            albumName: data.albumName,
            duration: data.duration,
            previewUrl: data.previewUrl,
          },
          create: {
            spotifyId: data.spotifyId,
            title: data.title,
            artistName: data.artistName,
            albumName: data.albumName,
            duration: data.duration,
            previewUrl: data.previewUrl,
          },
        })
      )
    );

    const spotifyIds = ordered.map((o) => o.spotifyId);
    const tracks = await this.prisma.track.findMany({ where: { spotifyId: { in: spotifyIds } } });
    const bySpotifyId = new Map(tracks.map((t) => [t.spotifyId!, t] as const));
    return spotifyIds.map((sid) => bySpotifyId.get(sid)).filter(Boolean);
  }
}
