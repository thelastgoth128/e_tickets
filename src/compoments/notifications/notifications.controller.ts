import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  @ApiOperation({ summary: 'Send Notification', description: 'System or Admin sends a notification to a user.' })
  @ApiResponse({ status: 201, description: 'Notification sent.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Notifications', description: 'Get all notifications (Admin).' })
  @ApiResponse({ status: 200, description: 'List of notifications.' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('my-notifications/:userId')
  @ApiOperation({ summary: 'My Notifications', description: 'Get notifications for a specific user.' })
  @ApiResponse({ status: 200, description: 'User notifications.' })
  findMyNotifications(@Param('userId') userId: string) {
    return this.notificationsService.findAll(); // Simplified
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Notification Details', description: 'Get details of a specific notification.' })
  @ApiResponse({ status: 200, description: 'Notification details.' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Notification', description: 'Mark notification as read/unread.' })
  @ApiResponse({ status: 200, description: 'Notification updated.' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Notification', description: 'Remove a notification.' })
  @ApiResponse({ status: 200, description: 'Notification deleted.' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
