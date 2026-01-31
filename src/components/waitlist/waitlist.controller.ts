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
  @ApiOperation({ summary: 'Join Waitlist', description: 'User joins the waitlist for a sold-out event.' })
  @ApiResponse({ status: 201, description: 'Joined waitlist.' })
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Waitlist', description: 'View all waitlist entries (Organizer/Admin).' })
  @ApiResponse({ status: 200, description: 'List of waitlist entries.' })
  findAll() {
    return this.waitlistService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Waitlist Entry', description: 'Get details of a specific waitlist entry.' })
  @ApiResponse({ status: 200, description: 'Waitlist entry details.' })
  findOne(@Param('id') id: string) {
    return this.waitlistService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Waitlist Status', description: 'Update status of a waitlist entry (e.g., promoted to ticket holder).' })
  @ApiResponse({ status: 200, description: 'Waitlist status updated.' })
  update(@Param('id') id: string, @Body() updateWaitlistDto: UpdateWaitlistDto) {
    return this.waitlistService.update(+id, updateWaitlistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Leave Waitlist', description: 'User leaves the waitlist.' })
  @ApiResponse({ status: 200, description: 'Removed from waitlist.' })
  remove(@Param('id') id: string) {
    return this.waitlistService.remove(+id);
  }
}
