
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SpotifyTokenResponse, SpotifyUserInfo } from './dto/spotify-auth.dto';

@Injectable()
export class SpotifyService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('SPOTIFY_REDIRECT_URI') || '';
  }

  /**
   * Génère l'URL d'autorisation Spotify
   */
  generateAuthUrl(): string {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Impossible d\'échanger le code contre un token');
    }
  }

  /**
   * Récupère les informations de l'utilisateur Spotify
   */
  async getUserInfo(accessToken: string): Promise<SpotifyUserInfo> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Impossible de récupérer les informations utilisateur');
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Impossible de rafraîchir le token');
    }
  }

}
