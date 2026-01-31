import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'placeholder',
        pass: process.env.SMTP_PASS || 'placeholder',
      },
    });
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user: { user_id: createNotificationDto.userId } as any,
      event: createNotificationDto.eventId ? ({ event_id: createNotificationDto.eventId } as any) : null,
      status: NotificationStatus.PENDING,
    });
    const savedNotification = await this.notificationRepository.save(notification);

    // Trigger sending logic
    this.sendNotification(savedNotification);

    return savedNotification;
  }

  private async sendNotification(notification: Notification) {
    try {
      if (notification.type === NotificationType.EMAIL) {
        await this.transporter.sendMail({
          from: `"UNIMA Event Manager" <${process.env.SMTP_FROM || 'no-reply@unima.mw'}>`,
          to: 'user@example.com', // In reality, fetch user email
          subject: 'UNIMA Event Notification',
          text: notification.message_content,
        });
      } else if (notification.type === NotificationType.SMS) {
        console.log(`Sending SMS stub: ${notification.message_content}`);
      } else if (notification.type === NotificationType.IN_APP) {
        console.log(`Sending Push Notification stub: ${notification.message_content}`);
      }

      notification.status = NotificationStatus.SENT;
    } catch (error) {
      console.error('Failed to send notification:', error);
      notification.status = NotificationStatus.FAILED;
    }
    await this.notificationRepository.save(notification);
  }

  async sendTicketEmail(email: string, eventTitle: string, qrCode: string, qrDataURL: string) {
    try {
      await this.transporter.sendMail({
        from: `"UNIMA Event Manager" <${process.env.SMTP_FROM || 'no-reply@unima.mw'}>`,
        to: email,
        subject: `Your Ticket for ${eventTitle}`,
        html: `
          <h1>Your Ticket for ${eventTitle}</h1>
          <p>Scan this QR code at the gate:</p>
          <img src="${qrDataURL}" alt="Ticket QR Code" />
          <p>Ticket ID: ${qrCode}</p>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send ticket email:', error);
      return false;
    }
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: ['user', 'event'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { notification_id: id },
      relations: ['user', 'event'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    const updatedNotification = this.notificationRepository.merge(notification, updateNotificationDto as any);
    return await this.notificationRepository.save(updatedNotification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }
}
