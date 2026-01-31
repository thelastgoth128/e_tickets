import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizerDto {
    @ApiProperty({ example: 'Unima Events Team', description: 'Name of the organizer or organization' })
    name: string;

    @ApiProperty({ example: 'events@unima.ac.mw', description: 'Contact email' })
    email: string;

    @ApiProperty({ example: '+265 999 123 456', description: 'Contact phone number' })
    phone: string;

    @ApiProperty({ example: 'Official events organizer for the university', description: 'Description of the organizer' })
    description: string;
}
