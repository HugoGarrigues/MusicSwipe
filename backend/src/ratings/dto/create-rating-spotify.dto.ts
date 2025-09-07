import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingSpotifyDto {
  @ApiProperty({ example: '3n3Ppam7vgaVa1iaRUc9Lp', description: 'Spotify track ID' })
  @IsString()
  spotifyId: string;

  @ApiProperty({ example: 5, description: 'Note entre 1 et 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ example: 'Mr. Brightside' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'The Killers' })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional({ example: 'Hot Fuss' })
  @IsOptional()
  @IsString()
  albumName?: string;

  @ApiPropertyOptional({ example: 222 })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ example: 'https://p.scdn.co/mp3-preview/...' })
  @IsOptional()
  @IsString()
  previewUrl?: string;
}

