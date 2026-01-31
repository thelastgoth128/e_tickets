import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import { UpdateAuditLogDto } from './dto/update-audit_log.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('audit-log')
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) { }

  @Post()
  @ApiOperation({
    summary: 'Create Audit Log',
    description: 'Manually create an audit log entry. System logs are usually generated automatically. \n\n**Role: Organizer, Admin**'
  })
  @ApiResponse({ status: 201, description: 'Audit log entry created.' })
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List Audit Logs',
    description: 'List all audit logs in the system. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of audit logs.' })
  findAll() {
    return this.auditLogService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get Audit Logs by User',
    description: 'Get all audit logs associated with a specific user. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of audit logs for user.' })
  findByUser(@Param('userId') userId: string) {
    return this.auditLogService.findByUser(userId);
  }

  @Get('event/:eventId')
  @ApiOperation({
    summary: 'Get Audit Logs by Event',
    description: 'Get all audit logs associated with a specific event. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of audit logs for event.' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.auditLogService.findByEvent(eventId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Audit Log Details',
    description: 'Get details of a specific audit log entry. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Audit log entry details.' })
  findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Audit Log', description: 'Update audit log details. \n\n**Role: Admin**' })
  @ApiResponse({ status: 200, description: 'Audit log updated.' })
  update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogService.update(id, updateAuditLogDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Audit Log',
    description: 'Remove an audit log entry from the system. \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Audit log entry deleted.' })
  remove(@Param('id') id: string) {
    return this.auditLogService.remove(id);
  }
}
