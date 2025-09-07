// src/tracks/entities/track.entity.ts

import { Track } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { LikeEntity } from 'src/likes/entities/like.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { RatingEntity } from 'src/ratings/entities/rating.entity';

export class TrackEntity implements Track {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  spotifyId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  artistName: string | null;

  @ApiProperty({ required: false, nullable: true })
  albumName: string | null;

  @ApiProperty({ required: false, nullable: true })
  duration: number | null;

  @ApiProperty({ required: false, nullable: true })
  previewUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relations (optional in responses)
  @ApiProperty({ type: [LikeEntity], required: false })
  Like?: LikeEntity[];

  @ApiProperty({ type: [CommentEntity], required: false })
  Comment?: CommentEntity[];

  @ApiProperty({ type: [RatingEntity], required: false })
  Rating?: RatingEntity[];
}
