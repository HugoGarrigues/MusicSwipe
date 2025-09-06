import { Body, Controller, Post, Get, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { SpotifyAuthDto, SpotifyLinkDto } from './dto/spotify-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body(ValidationPipe) { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User identity' })
  me(@Req() req: any) {
    return req.user;
  }

  // ===== ROUTES SPOTIFY =====

  @Get('spotify/auth-url')
  @ApiOperation({ summary: 'Générer l\'URL d\'autorisation Spotify pour l\'authentification' })
  @ApiOkResponse({ 
    description: 'URL d\'autorisation Spotify générée',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string', description: 'URL d\'autorisation Spotify' }
      }
    }
  })
  generateSpotifyAuthUrl() {
    return this.authService.generateSpotifyAuthUrl();
  }

  @Post('spotify/auth')
  @ApiOperation({ summary: 'Authentification via Spotify (création de compte ou connexion)' })
  @ApiOkResponse({ type: AuthEntity })
  @ApiResponse({ status: 400, description: 'Code d\'autorisation invalide' })
  @ApiResponse({ status: 401, description: 'Erreur d\'authentification' })
  spotifyAuth(@Body(ValidationPipe) spotifyAuthDto: SpotifyAuthDto) {
    return this.authService.spotifyAuth(spotifyAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('spotify/link-url')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer l\'URL d\'autorisation Spotify pour lier un compte' })
  @ApiOkResponse({ 
    description: 'URL d\'autorisation Spotify générée pour lier un compte',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string', description: 'URL d\'autorisation Spotify' }
      }
    }
  })
  generateSpotifyLinkUrl() {
    return this.authService.generateSpotifyLinkUrl();
  }

  @UseGuards(JwtAuthGuard)
  @Post('spotify/link')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lier un compte Spotify à l\'utilisateur connecté' })
  @ApiOkResponse({ 
    description: 'Compte Spotify lié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message de confirmation' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Code d\'autorisation invalide' })
  @ApiResponse({ status: 401, description: 'Utilisateur non authentifié' })
  @ApiResponse({ status: 409, description: 'Compte Spotify déjà lié' })
  linkSpotifyAccount(@Body(ValidationPipe) spotifyLinkDto: SpotifyLinkDto, @Req() req: any) {
    return this.authService.linkSpotifyAccount(req.user.id, spotifyLinkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('spotify/unlink')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Délier le compte Spotify de l\'utilisateur connecté' })
  @ApiOkResponse({ 
    description: 'Compte Spotify délié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message de confirmation' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Aucun compte Spotify lié trouvé' })
  @ApiResponse({ status: 409, description: 'Impossible de délier - risque de perte d\'accès au compte' })
  unlinkSpotifyAccount(@Req() req: any) {
    return this.authService.unlinkSpotifyAccount(req.user.id);
  }
}
