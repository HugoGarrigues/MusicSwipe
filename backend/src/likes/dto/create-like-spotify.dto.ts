import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLikeSpotifyDto {
  @ApiProperty({ example: '3n3Ppam7vgaVa1iaRUc9Lp', description: 'Spotify track ID' })
  @IsString()
  spotifyId: string;

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
  duration?: number;

  @ApiPropertyOptional({ example: 'https://p.scdn.co/mp3-preview/...' })
  @IsOptional()
  @IsString()
  previewUrl?: string;
}

