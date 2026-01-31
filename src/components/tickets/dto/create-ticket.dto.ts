import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the event' })
    eventId: string;

    @ApiProperty({ example: 1, description: 'ID of the ticket tier to purchase' })
    tierId: number;

    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user purchasing the ticket (optional)', required: false })
    userId?: string;

    @ApiProperty({ example: 1, description: 'ID of the buyer purchasing the ticket (legacy support)', required: false })
    buyerId?: number;
}
