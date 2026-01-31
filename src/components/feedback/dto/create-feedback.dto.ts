import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
    @ApiProperty({ example: 1, description: 'ID of the event being reviewed' })
    eventId: number;

    @ApiProperty({ example: 5, description: 'Rating out of 5', minimum: 1, maximum: 5 })
    rating: number;

    @ApiProperty({ example: 'Great event! Very organized.', description: 'Comments about the event' })
    comment: string;
}
