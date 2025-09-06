import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SpotifyAuthDto {
  @ApiProperty({
    description: 'Code d\'autorisation retourné par Spotify',
    example: 'AQBx...'
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class SpotifyLinkDto {
  @ApiProperty({
    description: 'Code d\'autorisation retourné par Spotify',
    example: 'AQBx...'
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class SpotifyUserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  display_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  images: Array<{ url: string; height: number; width: number }>;

  @ApiProperty()
  country: string;

  @ApiProperty()
  followers: {
    total: number;
  };
}

export class SpotifyTokenResponse {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  token_type: string;

  @ApiProperty()
  expires_in: number;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  scope: string;
}
