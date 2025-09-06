import { ApiProperty } from '@nestjs/swagger';

export class FollowEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  followerId: number;

  @ApiProperty()
  followedId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<FollowEntity>) {
    Object.assign(this, partial);
  }
}
