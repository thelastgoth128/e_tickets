import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
    @ApiProperty({ example: 'CREATE_EVENT', description: 'Action performed' })
    action: string;

    @ApiProperty({ example: 'Event', description: 'Entity affected' })
    entity: string;

    @ApiProperty({ example: 'User 1 created Event 5', description: 'Details of the action' })
    details: string;

    @ApiProperty({ example: 1, description: 'ID of the user who performed the action' })
    userId: number;
}
