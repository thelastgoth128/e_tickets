import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) { }

  @Post()
  @ApiOperation({
    summary: 'Join Waitlist',
    description: 'Join the waitlist for an event. \n\n**Role: Buyer**'
  })
  @ApiResponse({ status: 201, description: 'Successfully joined waitlist.' })
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List Waitlist',
    description: 'List all waitlist entries. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of waitlist entries.' })
  findAll() {
    return this.waitlistService.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({
    summary: 'Get Waitlist by Event',
    description: 'Get all users waiting for a specific event. \n\n**Role: Organizer, Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of waitlisted users for event.' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.waitlistService.findByEvent(eventId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Waitlist Entry Details',
    description: 'Get details of a specific waitlist entry. \n\n**Role: Buyer (self), Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Waitlist entry details.' })
  findOne(@Param('id') id: string) {
    return this.waitlistService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Waitlist Status',
    description: 'Update the status of a waitlist entry (e.g., mark as offered). \n\n**Role: Admin**'
  })
  @ApiResponse({ status: 200, description: 'Waitlist status updated.' })
  update(@Param('id') id: string, @Body() updateWaitlistDto: UpdateWaitlistDto) {
    return this.waitlistService.update(id, updateWaitlistDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Leave Waitlist',
    description: 'Remove a waitlist entry. \n\n**Role: Buyer (self), Admin**'
  })
  @ApiResponse({ status: 200, description: 'Successfully left waitlist.' })
  remove(@Param('id') id: string) {
    return this.waitlistService.remove(id);
  }
}
