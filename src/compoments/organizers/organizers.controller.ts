import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) { }

  @Post()
  @ApiOperation({ summary: 'Register as Organizer', description: 'Registers a new organizer profile.' })
  @ApiResponse({ status: 201, description: 'Organizer created.' })
  create(@Body() createOrganizerDto: CreateOrganizerDto) {
    return this.organizersService.create(createOrganizerDto);
  }

  @Get()
  @ApiOperation({ summary: 'List Organizers', description: 'Retrieve a list of all organizers.' })
  @ApiResponse({ status: 200, description: 'List of organizers.' })
  findAll() {
    return this.organizersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Organizer details', description: 'Retrieve specific organizer details.' })
  @ApiResponse({ status: 200, description: 'Organizer details.' })
  findOne(@Param('id') id: string) {
    return this.organizersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Organizer', description: 'Update organizer profile.' })
  @ApiResponse({ status: 200, description: 'Organizer updated.' })
  update(@Param('id') id: string, @Body() updateOrganizerDto: UpdateOrganizerDto) {
    return this.organizersService.update(+id, updateOrganizerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Organizer', description: 'Remove an organizer profile. Admin only.' })
  @ApiResponse({ status: 200, description: 'Organizer deleted.' })
  remove(@Param('id') id: string) {
    return this.organizersService.remove(+id);
  }
}
