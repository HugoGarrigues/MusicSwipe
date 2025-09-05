import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'hgrs@example.com',
    description: "Adresse email de l'utilisateur",
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: "Mot de passe de l'utilisateur (au moins 6 caractères)",
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(50, { message: 'Le mot de passe ne doit pas dépasser 50 caractères' })
  password: string;
}
