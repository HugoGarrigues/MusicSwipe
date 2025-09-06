import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '@prisma/client';

export class CommentEntity implements Comment {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  trackId: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;
}

