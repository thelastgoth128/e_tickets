import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({ example: 1, description: 'ID of the ticket tier to purchase' })
    tierId: number;

    @ApiProperty({ example: 1, description: 'ID of the buyer purchasing the ticket' })
    buyerId: number;
}
