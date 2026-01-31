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
  @ApiOperation({
    summary: 'Create Event',
    description: 'Create a new event. \n\n**Role: Organizer**'
  })
  @ApiResponse({ status: 201, description: 'Event created.' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List Events',
    description: 'Publicly list all published events. \n\n**Role: Buyer, Organizer, Verifier, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of events.' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Event Details',
    description: 'Get details of a specific event. \n\n**Role: Buyer, Organizer, Verifier, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Event',
    description: 'Update event details. \n\n**Role: Organizer**'
  })
  @ApiResponse({ status: 200, description: 'Event updated.' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Event',
    description: 'Permamently remove an event. \n\n**Role: Organizer, Admin**'
  })
  @ApiResponse({ status: 200, description: 'Event deleted.' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publish Event',
    description: 'Make an event visible to buyers. \n\n**Role: Organizer**'
  })
  @ApiResponse({ status: 200, description: 'Event published.' })
  publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel Event',
    description: 'Cancel an event and trigger automatic refunds. \n\n**Role: Organizer, Admin**'
  })
  @ApiResponse({ status: 200, description: 'Event cancelled.' })
  cancel(@Param('id') id: string) {
    return this.eventsService.cancel(id);
  }
}
