import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
    //@IsString()
    full_name: string;

    @ApiProperty({ example: 'john@example.com', description: 'The email of the user' })
    //@IsEmail()
    email: string;

    @ApiProperty({ example: 'Buyer', enum: UserRole, description: 'The role of the user' })
    //@IsEnum(UserRole)
    //@IsOptional()
    role?: UserRole;

    @ApiProperty({ example: 'password123', description: 'The password of the user' })
    //@IsString()
    //@MinLength(6)
    password: string;

    @ApiProperty({ example: '+265888123456', description: 'The phone number of the user', required: false })
    //@IsString()
    //@IsOptional()
    phone_number?: string;

    @ApiProperty({ example: 'UNIMA-2023-0001', description: 'The student number (if applicable)', required: false })
    //@IsString()
    //@IsOptional()
    student_number?: string;

}
