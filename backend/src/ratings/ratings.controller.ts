import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CreateRatingSpotifyDto } from './dto/create-rating-spotify.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingEntity } from './entities/rating.entity';
import { RatingsService } from './ratings.service';

@Controller('ratings')
@ApiTags('Ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiCreatedResponse({ type: RatingEntity })
  create(@Req() req: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(req.user.id, dto);
  }

  @Post('spotify')
  @ApiCreatedResponse({ type: RatingEntity, description: 'Upsert track by spotifyId then upsert rating' })
  createBySpotify(@Req() req: any, @Body() dto: CreateRatingSpotifyDto) {
    return this.ratingsService.upsertBySpotify(req.user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: RatingEntity, isArray: true })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'trackId', required: false, type: Number })
  findAll(@Query('userId') userId?: string, @Query('trackId') trackId?: string) {
    const u = userId ? Number(userId) : undefined;
    const t = trackId ? Number(trackId) : undefined;
    return this.ratingsService.findAll({ userId: u, trackId: t });
  }

  @Get(':id')
  @ApiOkResponse({ type: RatingEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: RatingEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(id, { id: req.user.id, isAdmin: req.user.isAdmin }, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RatingEntity })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ratingsService.remove(id, { id: req.user.id, isAdmin: req.user.isAdmin });
  }

  

  @Get('track/:trackId/average')
  @ApiOkResponse({ description: 'Moyenne des notes et nombre de votes', schema: { properties: { trackId: { type: 'number' }, average: { type: 'number' }, count: { type: 'number' } } } })
  average(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.ratingsService.averageForTrack(trackId);
  }
}
