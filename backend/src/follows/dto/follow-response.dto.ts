import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  followerId: number;

  @ApiProperty()
  followedId: number;

  @ApiProperty()
  createdAt: Date;
}

export class FollowStatsDto {
  @ApiProperty({
    description: 'Nombre d\'utilisateurs suivis',
    example: 42
  })
  followingCount: number;

  @ApiProperty({
    description: 'Nombre de followers',
    example: 128
  })
  followersCount: number;
}

export class UserFollowInfoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatarUrl: string | null;

  @ApiProperty()
  isFollowing: boolean;

  @ApiProperty()
  followedAt?: Date;
}
