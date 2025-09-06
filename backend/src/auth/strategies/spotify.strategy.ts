import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as SpotifyStrategyBase, Profile } from 'passport-spotify';
import { Request } from 'express';

/**
 * Passport strategy for authenticating with Spotify.
 * Refresh tokens are persisted for later use, but are not currently
 * utilized by the application.
 */
@Injectable()
export class SpotifyStrategy extends PassportStrategy(SpotifyStrategyBase, 'spotify') {
  constructor() {
    super({
      clientID: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      callbackURL: process.env.SPOTIFY_CALLBACK_URL as string,
      scope: ['user-read-email', 'user-read-private'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    params: any,
    profile: Profile,
  ) {
    const expiresAt = new Date(Date.now() + params.expires_in * 1000);

    return {
      spotify: {
        oauthId: profile.id,
        accessToken,
        refreshToken, // stored for potential future use
        expiresAt,
      },
      profile: {
        email: profile.emails?.[0]?.value ?? null,
        displayName: profile.displayName ?? null,
        photos: profile.photos ?? [],
      },
      state: (req.query?.state as string) ?? null,
    };
  }
}

