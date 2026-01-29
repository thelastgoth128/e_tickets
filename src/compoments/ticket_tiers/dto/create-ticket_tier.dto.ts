import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketTierDto {
    @ApiProperty({ example: 'VIP', description: 'Name of the ticket tier' })
    name: string;

    @ApiProperty({ example: 50.00, description: 'Price of the ticket tier' })
    price: number;

    @ApiProperty({ example: 100, description: 'Total number of tickets available in this tier' })
    capacity: number;

    @ApiProperty({ example: 1, description: 'ID of the event this tier belongs to' })
    eventId: number;
}
