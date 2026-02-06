import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionDto } from 'src/components/transactions/dto/create-transaction.dto';

export class CreateTicketDto {
    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the event' })
    eventId: string;

    @ApiProperty({ example: 'uuid-tier-123', description: 'ID of the ticket tier to purchase' })
    tierId: string;

    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user purchasing the ticket (optional)', required: false })
    userId?: string;

    @ApiProperty({ example: '1', description: "any number of tickets, not over the available", required: false })
    capacity: number;

    @ApiProperty({ example: "payment amount", description: "The total payment amount for the ticket(s)" })
    payments: CreateTransactionDto[]

    @ApiProperty({ example: 1, description: 'ID of the buyer purchasing the ticket (legacy support)', required: false })
    buyerId?: number;
}
