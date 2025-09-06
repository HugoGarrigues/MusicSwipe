import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class FollowUserDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur à suivre',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  userId: number;
}
