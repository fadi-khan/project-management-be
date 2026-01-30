import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/enums/UserType';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  
  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body(ValidationPipe) createTaskDto: CreateTaskDto) {
    return await this.taskService.create(createTaskDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN,UserRole.MEMBER)
  // @UseGuards(RolesGuard)
  async findAll(@Query(ValidationPipe) filters: FilterTaskDto , @Req() req) {
    return await this.taskService.findAll(filters, req);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    return await this.taskService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateTaskDto: UpdateTaskDto) {
    return await this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(+id);
  }
}
