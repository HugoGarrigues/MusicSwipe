import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

   async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }
        if (error.meta?.target?.includes('username')) {
          throw new ConflictException('Un utilisateur avec ce nom d\'utilisateur existe déjà');
        }
        throw new ConflictException('Un utilisateur avec ces informations existe déjà');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }


  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw e;
    }
  }
}
