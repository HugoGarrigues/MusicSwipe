import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrackDto {
  @ApiProperty({ required: false, example: '3n3Ppam7vgaVa1iaRUc9Lp' })
  @IsOptional() @IsString() @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  spotifyId?: string;

  @ApiProperty({ example: 'Mr. Brightside' })
  @IsString() @IsNotEmpty() @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  @ApiProperty({ required: false, example: 'The Killers' })
  @IsOptional() @IsString() @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  artistName?: string;

  @ApiProperty({ required: false, example: 'Hot Fuss' })
  @IsOptional() @IsString() @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  albumName?: string;

  @ApiProperty({ required: false, example: 222, description: 'Durée en secondes' })
  @IsOptional() @IsInt() @IsPositive()
  duration?: number;

  @ApiProperty({ required: false, example: 'https://i.scdn.co/image/ab67616d00001e0263f...' })
  @IsOptional() @IsUrl()
  coverUrl?: string;

  @ApiProperty({ required: false, example: 'https://p.scdn.co/mp3-preview/xxxx' })
  @IsOptional() @IsUrl()
  previewUrl?: string;
}
