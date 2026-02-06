import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { TicketTier } from '../ticket_tiers/entities/ticket_tier.entity';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
  ) { }

  async createBulk(data: { eventId: string, tierId: string, userId?: string, quantity: number, transactionId: number }): Promise<Ticket[]> {
    const { eventId, tierId, userId, quantity } = data;

    const tier = await this.ticketTierRepository.findOne({ where: { tier_id: tierId } });
    if (!tier) {
      throw new NotFoundException(`Ticket Tier with ID ${tierId} not found`);
    }

    if (tier.capacity < quantity) {
      throw new BadRequestException(`Not enough capacity. Requested ${quantity}, available ${tier.capacity}`);
    }

    const tickets: Ticket[] = [];
    for (let i = 0; i < quantity; i++) {
      const qrData = uuidv4();
      const ticket = this.ticketRepository.create({
        QR_code: qrData,
        status: TicketStatus.ACTIVE,
        event: { event_id: eventId } as any,
        ticketTier: tier,
        user: userId ? ({ user_id: userId } as any) : null,
      });
      tickets.push(ticket);
    }

    // Update capacity
    tier.capacity -= quantity;
    await this.ticketTierRepository.save(tier);

    return await this.ticketRepository.save(tickets);
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    // Legacy single creation for direct admin use or similar
    const result = await this.createBulk({
      eventId: createTicketDto.eventId,
      tierId: createTicketDto.tierId,
      userId: createTicketDto.userId,
      quantity: 1,
      transactionId: 0, // Not applicable for direct creation
    });
    return result[0];
  }

  async generateQRDataURL(qrCode: string): Promise<string> {
    try {
      return await QRCode.toDataURL(qrCode);
    } catch (err) {
      throw new BadRequestException('Failed to generate QR code image');
    }
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      relations: ['event', 'ticketTier', 'user'],
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticket_id: id },
      relations: ['event', 'ticketTier', 'user'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async findByQR(qrCode: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { QR_code: qrCode },
      relations: ['event', 'ticketTier', 'user'],
    });
    if (!ticket) {
      throw new NotFoundException(`Invalid ticket QR code`);
    }
    return ticket;
  }

  async validateTicket(qrCode: string): Promise<Ticket> {
    const ticket = await this.findByQR(qrCode);

    if (ticket.status === TicketStatus.REDEEMED) {
      throw new BadRequestException('Ticket has already been redeemed');
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new BadRequestException(`Ticket is not active (Status: ${ticket.status})`);
    }

    ticket.status = TicketStatus.REDEEMED;
    ticket.redeemed_at = new Date();
    return await this.ticketRepository.save(ticket);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const updatedTicket = this.ticketRepository.merge(ticket, updateTicketDto as any);
    return await this.ticketRepository.save(updatedTicket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }
}
