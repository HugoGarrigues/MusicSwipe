import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({ example: 1, description: 'ID du track à liker' })
  @IsInt()
  trackId: number;
}

