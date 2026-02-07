import { ApiProperty } from '@nestjs/swagger';


export class PayChanguWebhookDataDto {
    @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    tx_ref: string;

    @ApiProperty()
    //@IsNotEmpty()
    amount: number | string;

    @ApiProperty({ required: false })
    charge?: number | string;

    @ApiProperty({ required: false })
    net_amount?: number | string;

    @ApiProperty({ required: false })
    status?: string;

    @ApiProperty({ required: false })
    currency?: string;

    //@IsObject()
    @ApiProperty()
    metadata?: any;
}

export class PayChanguWebhookDto {
    @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    event: string;

    @ApiProperty({ type: PayChanguWebhookDataDto })
    // @IsObject()
    // @IsNotEmpty()
    data: PayChanguWebhookDataDto;
}
