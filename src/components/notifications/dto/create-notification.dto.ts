import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user to notify' })
    userId: string;

    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the related event (optional)', required: false })
    eventId?: string;

    @ApiProperty({ example: NotificationType.EMAIL, enum: NotificationType, description: 'Type of notification' })
    type: NotificationType;

    @ApiProperty({ example: 'Your ticket has been confirmed!', description: 'Notification message content' })
    message_content: string;
}
