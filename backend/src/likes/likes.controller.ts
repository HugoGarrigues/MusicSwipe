import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateLikeDto } from './dto/create-like.dto';
import { LikeEntity } from './entities/like.entity';
import { LikesService } from './likes.service';
import { CreateLikeSpotifyDto } from './dto/create-like-spotify.dto';

@Controller('likes')
@ApiTags('Likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ApiCreatedResponse({ type: LikeEntity })
  like(@Req() req: any, @Body() dto: CreateLikeDto) {
    return this.likesService.likeTrack(req.user.id, dto.trackId);
  }

  @Post('spotify')
  @ApiCreatedResponse({ type: LikeEntity, description: 'Upsert track by spotifyId then like idempotently' })
  likeBySpotify(@Req() req: any, @Body() dto: CreateLikeSpotifyDto) {
    return this.likesService.likeBySpotify(req.user.id, dto);
  }

  @Delete('track/:trackId')
  @ApiOkResponse({ description: 'Unliked' })
  unlike(@Req() req: any, @Param('trackId', ParseIntPipe) trackId: number) {
    return this.likesService.unlikeTrack(req.user.id, trackId);
  }

  @Get()
  @ApiOkResponse({ type: LikeEntity, isArray: true })
  myLikes(@Req() req: any) {
    return this.likesService.myLikes(req.user.id);
  }

  @Get('track/:trackId')
  @ApiOkResponse({ description: 'Etat du like', schema: { properties: { trackId: { type: 'number' }, liked: { type: 'boolean' } } } })
  isLiked(@Req() req: any, @Param('trackId', ParseIntPipe) trackId: number) {
    return this.likesService.isLiked(req.user.id, trackId);
  }

  @Delete('spotify/:spotifyId')
  @ApiOkResponse({ description: 'Unliked' })
  unlikeBySpotify(@Req() req: any, @Param('spotifyId') spotifyId: string) {
    return this.likesService.unlikeBySpotify(req.user.id, spotifyId);
  }

  @Get('spotify/:spotifyId')
  @ApiOkResponse({ description: 'Etat du like', schema: { properties: { spotifyId: { type: 'string' }, liked: { type: 'boolean' } } } })
  isLikedBySpotify(@Req() req: any, @Param('spotifyId') spotifyId: string) {
    return this.likesService.isLikedBySpotify(req.user.id, spotifyId);
  }
}
