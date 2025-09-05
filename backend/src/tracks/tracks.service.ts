import { Injectable } from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}
  

  async create(createTrackDto: CreateTrackDto) {
  try {
    return await this.prisma.track.create({ data: createTrackDto });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('A track with this Spotify ID already exists.');
    }
    throw error;
  }
  }

  findAll() {
    return this.prisma.track.findMany({ where: { id: { not: -1 } } });
  }

  findOne(id: number) {
    return this.prisma.track.findUnique({ where: { id } });
  }

  update(id: number, updateTrackDto: UpdateTrackDto) {
       return this.prisma.track.update({
      where: { id },
      data: updateTrackDto,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.track.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`Track with id ${id} not found`);
      }
      throw e;
    }
  }
}
