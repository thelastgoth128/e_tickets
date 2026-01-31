import { ApiProperty } from '@nestjs/swagger';

export class CreateWaitlistDto {
    @ApiProperty({ example: 1, description: 'ID of the event to join waitlist for' })
    eventId: number;

    @ApiProperty({ example: 1, description: 'ID of the user joining the waitlist' })
    userId: number;
}
