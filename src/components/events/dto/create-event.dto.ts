import { ApiProperty } from '@nestjs/swagger';
import { CreateTicketTierDto } from 'src/components/ticket_tiers/dto/create-ticket_tier.dto';

export class CreateEventDto {
    @ApiProperty({ example: 'Unima Music Festival', description: 'Title of the event' })
    title: string;

    @ApiProperty({ example: 'Annual music festival featuring local artists', description: 'Detailed description of the event' })
    description: string;

    @ApiProperty({ example: '2023-12-25T18:00:00Z', description: 'Date and time of the event' })
    date: string;

    @ApiProperty({ example: 'The Great Hall', description: 'Location or venue of the event' })
    venue: string;

    @ApiProperty({ example: 500, description: 'Maximum capacity of the event' })
    capacity: number;

    @ApiProperty({ example: 1, description: 'ID of the organizer creating the event' })
    organizerId: string;

    tiers: CreateTicketTierDto[]

}
