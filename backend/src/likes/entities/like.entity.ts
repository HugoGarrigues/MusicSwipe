import { ApiProperty } from '@nestjs/swagger';
import { Like } from '@prisma/client';

export class LikeEntity implements Like {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  trackId: number;

  @ApiProperty()
  createdAt: Date;
}

