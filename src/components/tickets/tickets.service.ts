import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) { }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const qrData = uuidv4();
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      QR_code: qrData,
      status: TicketStatus.ACTIVE,
      event: { event_id: createTicketDto.eventId } as any,
      ticketTier: { id: createTicketDto.tierId } as any,
      user: createTicketDto.userId ? ({ user_id: createTicketDto.userId } as any) : null,
    });
    return await this.ticketRepository.save(ticket);
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
