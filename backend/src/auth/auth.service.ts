import { AuthEntity } from './entity/auth.entity';
import { PrismaService } from './../prisma/prisma.service';
import {Injectable, NotFoundException, UnauthorizedException, ConflictException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthDto, SpotifyLinkDto, SpotifyUserInfo } from './dto/spotify-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService,
    private spotifyService: SpotifyService
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    if (!user.password) {
      throw new UnauthorizedException('Account created with OAuth, please use Spotify login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  /**
   * Authentification via Spotify (création de compte ou connexion)
   */
  async spotifyAuth(spotifyAuthDto: SpotifyAuthDto): Promise<AuthEntity> {
    const { code } = spotifyAuthDto;

    const tokenResponse = await this.spotifyService.exchangeCodeForToken(code);
    
    const spotifyUser = await this.spotifyService.getUserInfo(tokenResponse.access_token);

    const existingOAuth = await this.prisma.userOAuth.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'spotify',
          providerUserId: spotifyUser.id,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      await this.prisma.userOAuth.update({
        where: { id: existingOAuth.id },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpires: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });

      return {
        accessToken: this.jwtService.sign({ userId: existingOAuth.user.id }),
      };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: spotifyUser.email },
    });

    let user;
    if (existingUser) {
      await this.prisma.userOAuth.create({
        data: {
          userId: existingUser.id,
          provider: 'spotify',
          providerUserId: spotifyUser.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpires: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });
      user = existingUser;
    } else {
      user = await this.prisma.user.create({
        data: {
          email: spotifyUser.email,
          username: spotifyUser.display_name || spotifyUser.id,
          avatarUrl: spotifyUser.images?.[0]?.url,
        },
      });

      await this.prisma.userOAuth.create({
        data: {
          userId: user.id,
          provider: 'spotify',
          providerUserId: spotifyUser.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpires: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });
    }

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  /**
   * Lier un compte Spotify à un utilisateur existant
   */
  async linkSpotifyAccount(userId: number, spotifyLinkDto: SpotifyLinkDto): Promise<{ message: string }> {
    const { code } = spotifyLinkDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const existingOAuth = await this.prisma.userOAuth.findFirst({
      where: {
        userId: userId,
        provider: 'spotify',
      },
    });

    if (existingOAuth) {
      throw new ConflictException('Un compte Spotify est déjà lié à cet utilisateur');
    }

    const tokenResponse = await this.spotifyService.exchangeCodeForToken(code);

    const spotifyUser = await this.spotifyService.getUserInfo(tokenResponse.access_token);

    const existingSpotifyOAuth = await this.prisma.userOAuth.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'spotify',
          providerUserId: spotifyUser.id,
        },
      },
    });

    if (existingSpotifyOAuth) {
      throw new ConflictException('Ce compte Spotify est déjà lié à un autre utilisateur');
    }

    await this.prisma.userOAuth.create({
      data: {
        userId: userId,
        provider: 'spotify',
        providerUserId: spotifyUser.id,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpires: new Date(Date.now() + tokenResponse.expires_in * 1000),
      },
    });

    return { message: 'Compte Spotify lié avec succès' };
  }

  /**
   * Délier un compte Spotify d'un utilisateur
   */
  async unlinkSpotifyAccount(userId: number): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const spotifyAccount = user.oauthAccounts.find(
      account => account.provider === 'spotify'
    );

    if (!spotifyAccount) {
      throw new NotFoundException('Aucun compte Spotify lié trouvé');
    }

    const hasPassword = !!user.password;
    const hasOtherOAuthAccounts = user.oauthAccounts.some(
      account => account.provider !== 'spotify'
    );

    if (!hasPassword && !hasOtherOAuthAccounts) {
      throw new ConflictException(
        'Impossible de délier le compte Spotify. Vous devez d\'abord définir un mot de passe ou lier un autre compte de connexion pour éviter de perdre l\'accès à votre compte.'
      );
    }

    await this.prisma.userOAuth.delete({
      where: { id: spotifyAccount.id },
    });

    return { message: 'Compte Spotify délié avec succès' };
  }

  /**
   * Générer l'URL d'autorisation Spotify pour l'authentification
   */
  generateSpotifyAuthUrl(): { authUrl: string } {
    const authUrl = this.spotifyService.generateAuthUrl();
    return { authUrl };
  }

  /**
   * Générer l'URL d'autorisation Spotify pour lier un compte
   */
  generateSpotifyLinkUrl(): { authUrl: string } {
    const authUrl = this.spotifyService.generateAuthUrl();
    return { authUrl };
  }
}