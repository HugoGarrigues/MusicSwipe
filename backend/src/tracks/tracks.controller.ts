import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TrackEntity } from './entities/track.entity';
import { ParseIntPipe, Query } from '@nestjs/common';

@Controller('tracks')
@ApiTags('Tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  @ApiCreatedResponse({ type: TrackEntity, description: 'The track has been successfully created.' })
  create(@Body() createTrackDto: CreateTrackDto) {
    return this.tracksService.create(createTrackDto);
  }

  @Get()
  @ApiOkResponse({ type: [TrackEntity], description: 'List of all tracks.' })
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TrackEntity, description: 'The track with the given ID.' })
  async findOne(@Param('id') id: string) {
    const track = await this.tracksService.findOne(+id);
    if (!track) {
      throw new NotFoundException(`Tracks with id : ${id} does not exist.`);
    }
    return track;
  }

  @Patch(':id')
  @ApiOkResponse({ type: TrackEntity, description: 'The track has been successfully updated.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrackDto: UpdateTrackDto) {
    return this.tracksService.update(id, updateTrackDto);
  }


  @Delete(':id')
  @ApiOkResponse({ type: TrackEntity, description: 'The track has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number) {
      return this.tracksService.remove(id);
    }
}
