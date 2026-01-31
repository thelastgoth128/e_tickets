import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
    @ApiProperty({ example: 1, description: 'ID of the user to notify' })
    userId: number;

    @ApiProperty({ example: 'Your ticket has been confirmed!', description: 'Notification message content' })
    message: string;
}
