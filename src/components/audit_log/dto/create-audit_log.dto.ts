import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
    @ApiProperty({ example: 'CREATE_EVENT', description: 'Action performed' })
    action: string;

    @ApiProperty({ example: 'uuid-user-123', description: 'ID of the user who performed the action' })
    userId: string;

    @ApiProperty({ example: 'uuid-event-123', description: 'ID of the related event (optional)', required: false })
    eventId?: string;

    @ApiProperty({ example: { ip: '127.0.0.1' }, description: 'Additional metadata', required: false })
    metadata?: any;
}
