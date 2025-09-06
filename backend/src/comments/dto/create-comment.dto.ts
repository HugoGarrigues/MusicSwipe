import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 1, description: 'ID du track concerné' })
  @IsInt()
  trackId: number;

  @ApiProperty({ example: 'Super morceau!', description: 'Contenu du commentaire' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content: string;
}

