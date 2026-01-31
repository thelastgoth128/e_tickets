import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the event being reviewed' })
    eventId: string;

    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user providing feedback' })
    userId: string;

    @ApiProperty({ example: 5, description: 'Rating out of 5', minimum: 1, maximum: 5 })
    rating: number;

    @ApiProperty({ example: 'Great event! Very organized.', description: 'Comments about the event' })
    comment: string;
}
