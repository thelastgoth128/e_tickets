import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
    @ApiProperty({ example: 1, description: 'ID of the transaction to refund' })
    transaction_id: number;

    @ApiProperty({ example: 1, description: 'ID of the buyer requesting refund', required: false })
    buyer_id?: number;

    @ApiProperty({ example: 'Event cancelled', description: 'Reason for the refund request' })
    reason: string;

    @ApiProperty({ example: 50.00, description: 'Amount to be refunded', required: false })
    refund_amount?: number;
}
