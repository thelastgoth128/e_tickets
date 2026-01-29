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
  @ApiOperation({ summary: 'Create Audit Log', description: 'System records an action. Internal use mostly.' })
  @ApiResponse({ status: 201, description: 'Log entry created.' })
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Audit Logs', description: 'View audit logs. Auditor/Admin only.' })
  @ApiResponse({ status: 200, description: 'List of audit logs.' })
  findAll() {
    return this.auditLogService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Audit Log Details', description: 'Get details of a specific audit log entry.' })
  @ApiResponse({ status: 200, description: 'Audit log details.' })
  findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Audit Log', description: 'Update audit log. Should be restricted.' })
  @ApiResponse({ status: 200, description: 'Audit log updated.' })
  update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogService.update(+id, updateAuditLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Audit Log', description: 'Remove audit log. Should be restricted.' })
  @ApiResponse({ status: 200, description: 'Audit log deleted.' })
  remove(@Param('id') id: string) {
    return this.auditLogService.remove(+id);
  }
}
