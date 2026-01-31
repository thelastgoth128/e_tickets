import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import { UpdateAuditLogDto } from './dto/update-audit_log.dto';
import { AuditLog } from './entities/audit_log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) { }

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...createAuditLogDto,
      user: { user_id: createAuditLogDto.userId } as any,
      event: createAuditLogDto.eventId ? ({ event_id: createAuditLogDto.eventId } as any) : null,
    });
    return await this.auditLogRepository.save(auditLog);
  }

  async log(action: string, userId: string, eventId?: string, metadata?: any): Promise<AuditLog> {
    return this.create({ action, userId, eventId, metadata });
  }

  async findAll(): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      relations: ['user', 'event'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { log_id: id },
      relations: ['user', 'event'],
    });
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return auditLog;
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { user: { user_id: userId } as any },
      relations: ['user', 'event'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByEvent(eventId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { event: { event_id: eventId } as any },
      relations: ['user', 'event'],
      order: { timestamp: 'DESC' },
    });
  }

  async update(id: string, updateAuditLogDto: UpdateAuditLogDto): Promise<AuditLog> {
    const auditLog = await this.findOne(id);
    const updatedAuditLog = this.auditLogRepository.merge(auditLog, updateAuditLogDto as any);
    return await this.auditLogRepository.save(updatedAuditLog);
  }

  async remove(id: string): Promise<void> {
    const auditLog = await this.findOne(id);
    await this.auditLogRepository.remove(auditLog);
  }
}
