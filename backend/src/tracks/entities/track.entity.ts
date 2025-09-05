// src/tracks/entities/track.entity.ts

import { Track } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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
}
