import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'Hgrs',
        description: "Nom d'utilisateur unique",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    username: string;

    @ApiProperty({
        example: 'hgrs@example.com',
        description: 'Adresse email unique de l’utilisateur',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'StrongP@ssw0rd!',
        description:
            'Mot de passe (au moins 6 caractères, avec minuscule, majuscule, chiffre et caractère spécial)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    })
    password: string;

    @ApiProperty({
        example: 'https://i.pravatar.cc/150?u=hgrs',
        description: "URL de l'avatar de l’utilisateur",
        required: false,
    })
    @IsOptional()
    @IsUrl({}, { message: "L'avatar doit être une URL valide" })
    avatarUrl?: string;
}
