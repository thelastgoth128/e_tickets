import { ApiProperty } from '@nestjs/swagger';

export class InitialPayoutDto {
    @ApiProperty({ example: '0999123456', description: 'Mobile number for payout' })
    mobile: string;

    @ApiProperty({ example: 1000, description: 'Amount to cash out' })
    amount: number;
}
