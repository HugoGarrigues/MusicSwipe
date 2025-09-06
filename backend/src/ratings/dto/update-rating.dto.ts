import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Max, Min, IsOptional } from 'class-validator';

export class UpdateRatingDto {
  @ApiPropertyOptional({ example: 4, description: 'Nouvelle note entre 1 et 5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  score?: number;
}

