import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: 1, description: 'ID du track à noter' })
  @IsInt()
  trackId: number;

  @ApiProperty({ example: 5, description: 'Note entre 1 et 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}

