import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @ApiOperation({ summary: 'Create Event', description: 'Organizer creates a new event.' })
  @ApiResponse({ status: 201, description: 'Event created.' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Events', description: 'Publicly list all published events.' })
  @ApiResponse({ status: 200, description: 'List of events.' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Event Details', description: 'Get details of a specific event.' })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Event', description: 'Organizer updates event details.' })
  @ApiResponse({ status: 200, description: 'Event updated.' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel Event', description: 'Organizer or Admin cancels an event.' })
  @ApiResponse({ status: 200, description: 'Event cancelled.' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
