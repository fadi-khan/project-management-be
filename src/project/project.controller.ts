import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/enums/UserType';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body(ValidationPipe) createProjectDto: CreateProjectDto , @Req() req: any) {
    return this.projectService.create(createProjectDto, req);
  }

  @Get()
  findAll(@Req() req, @Query('page') page: number = 1) {
    return this.projectService.findAll(page,req);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body(ValidationPipe) updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}


