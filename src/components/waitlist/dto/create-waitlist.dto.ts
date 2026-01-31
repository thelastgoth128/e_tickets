import { ApiProperty } from '@nestjs/swagger';

export class CreateWaitlistDto {
    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the event to join waitlist for' })
    eventId: string;

    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user joining the waitlist' })
    userId: string;
}
