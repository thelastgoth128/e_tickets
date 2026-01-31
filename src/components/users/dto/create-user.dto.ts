import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'The email of the user' })
    email: string;

    @ApiProperty({ example: 'buyer', description: 'The role of the user (e.g., buyer, organizer, admin)' })
    role: string;

    @ApiProperty({ example: 'password123', description: 'The password of the user' })
    password: string;
}
