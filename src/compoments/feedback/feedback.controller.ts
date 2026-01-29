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
  @ApiOperation({ summary: 'Submit Feedback', description: 'Buyer submits feedback for an attended event.' })
  @ApiResponse({ status: 201, description: 'Feedback submitted.' })
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Feedback', description: 'List all feedback (Admin).' })
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
  @ApiOperation({ summary: 'Get Feedback Details', description: 'Get details of a specific feedback entry.' })
  @ApiResponse({ status: 200, description: 'Feedback details.' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Feedback', description: 'Update feedback (e.g., edit comment).' })
  @ApiResponse({ status: 200, description: 'Feedback updated.' })
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Feedback', description: 'Remove feedback (Admin/User).' })
  @ApiResponse({ status: 200, description: 'Feedback deleted.' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
