import { ApiProperty } from '@nestjs/swagger';
import { Rating } from '@prisma/client';

export class RatingEntity implements Rating {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  trackId: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  score: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

