import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowStatsDto, UserFollowInfoDto } from './dto/follow-response.dto';
import { FollowUserDto } from './dto/follow-user.dto';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Suivre un utilisateur
   */
  async followUser(followerId: number, followUserDto: FollowUserDto) {
    const { userId: followedId } = followUserDto;

    // Vérifier qu'on ne se suit pas soi-même
    if (followerId === followedId) {
      throw new ForbiddenException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier que l'utilisateur à suivre existe
    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followedId },
    });

    if (!userToFollow) {
      throw new NotFoundException('Utilisateur à suivre non trouvé');
    }

    // Vérifier qu'on ne suit pas déjà cet utilisateur
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Vous suivez déjà cet utilisateur');
    }

    // Créer la relation de suivi
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followedId,
      },
    });

    return follow;
  }

  /**
   * Ne plus suivre un utilisateur
   */
  async unfollowUser(followerId: number, followedId: number) {
    // Vérifier que la relation de suivi existe
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('Vous ne suivez pas cet utilisateur');
    }

    // Supprimer la relation de suivi
    await this.prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    return { message: 'Vous ne suivez plus cet utilisateur' };
  }

  /**
   * Obtenir les statistiques de suivi d'un utilisateur
   */
  async getFollowStats(userId: number): Promise<FollowStatsDto> {
    const [followingCount, followersCount] = await Promise.all([
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
      this.prisma.follow.count({
        where: { followedId: userId },
      }),
    ]);

    return {
      followingCount,
      followersCount,
    };
  }

  /**
   * Obtenir la liste des utilisateurs suivis
   */
  async getFollowing(userId: number, currentUserId?: number): Promise<UserFollowInfoDto[]> {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        followed: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let followingSet = new Set<number>();
    if (currentUserId) {
      const ids = following.map((f) => f.followed.id);
      if (ids.length) {
        const rels = await this.prisma.follow.findMany({
          where: { followerId: currentUserId, followedId: { in: ids } },
          select: { followedId: true },
        });
        followingSet = new Set(rels.map((r) => r.followedId));
      }
    }

    return following.map((follow) => ({
      id: follow.followed.id,
      username: follow.followed.username,
      email: follow.followed.email,
      avatarUrl: follow.followed.avatarUrl,
      isFollowing: currentUserId ? followingSet.has(follow.followed.id) : false,
      followedAt: follow.createdAt,
    }));
  }

  /**
   * Obtenir la liste des followers
   */
  async getFollowers(userId: number, currentUserId?: number): Promise<UserFollowInfoDto[]> {
    const followers = await this.prisma.follow.findMany({
      where: { followedId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let followingSet = new Set<number>();
    if (currentUserId) {
      const ids = followers.map((f) => f.follower.id);
      if (ids.length) {
        const rels = await this.prisma.follow.findMany({
          where: { followerId: currentUserId, followedId: { in: ids } },
          select: { followedId: true },
        });
        followingSet = new Set(rels.map((r) => r.followedId));
      }
    }

    return followers.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      email: follow.follower.email,
      avatarUrl: follow.follower.avatarUrl,
      isFollowing: currentUserId ? followingSet.has(follow.follower.id) : false,
      followedAt: follow.createdAt,
    }));
  }

  /**
   * Vérifier si un utilisateur suit un autre utilisateur
   */
  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    return !!follow;
  }
}
