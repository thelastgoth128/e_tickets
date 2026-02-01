import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/authGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)', description: 'Allows admins to create new users directly.' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'List all users (Admin/Auditor only)', description: 'Retrieve a list of all users.' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get a user by ID', description: 'Retrieve details of a specific user.' })
  @ApiResponse({ status: 200, description: 'User details.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user (Admin only)', description: 'Update user details.' })
  @ApiResponse({ status: 200, description: 'User updated.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)', description: 'Remove a user from the system.' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
