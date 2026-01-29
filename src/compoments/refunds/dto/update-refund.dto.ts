import { ApiProperty } from '@nestjs/swagger';

export class UpdateRefundDto {
    @ApiProperty({ example: 'APPROVED', description: 'Status of the refund', enum: ['APPROVED', 'REJECTED', 'COMPLETED'] })
    status: string;

    @ApiProperty({ example: 'Event was cancelled by organizer', description: 'Admin notes on the refund decision', required: false })
    admin_notes?: string;

    @ApiProperty({ example: 1, description: 'ID of the admin processing the refund' })
    processed_by: number;
}
