import { Controller, Post, Body, Headers, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { Public } from '../auth/guards/public';
import { PayChanguWebhookDto } from './dto/paychangu-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Public()
    @Post('paychangu')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle PayChangu webhooks' })
    @ApiHeader({
        name: 'x-paychangu-signature',
        description: 'HMAC SHA256 signature for payload verification',
        required: true,
    })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid signature or payload' })
    async handlePayChanguWebhook(
        @Body() dto: PayChanguWebhookDto,
        @Headers('x-paychangu-signature') signature: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing x-paychangu-signature header');
        }

        const isValid = this.webhooksService.verifySignature(dto, signature);
        if (!isValid) {
            throw new BadRequestException('Invalid webhook signature');
        }

        await this.webhooksService.handleWebhook(dto);

        return { status: 'success' };
    }
}
