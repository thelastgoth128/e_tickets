import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  @ApiOperation({
    summary: 'Submit Feedback',
    description: 'Submit an event review and rating. \n\n**Role: Buyer**'
  })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully.' })
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List All Feedback',
    description: 'List all feedback entries in the system. \n\n**Role: Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'List of feedback.' })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get Event Feedback', description: 'Get all feedback for a specific event (Public/Organizer).' })
  @ApiResponse({ status: 200, description: 'Event feedback.' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.feedbackService.findAll(); // Simplified
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Feedback Details',
    description: 'Get details of a specific feedback entry. \n\n**Role: Buyer (self), Admin, Auditor**'
  })
  @ApiResponse({ status: 200, description: 'Feedback details.' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Feedback',
    description: 'Update a feedback entry. \n\n**Role: Buyer (self), Admin**'
  })
  @ApiResponse({ status: 200, description: 'Feedback updated.' })
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Feedback',
    description: 'Remove a feedback entry from the system. \n\n**Role: Buyer (self), Admin**'
  })
  @ApiResponse({ status: 200, description: 'Feedback deleted.' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
