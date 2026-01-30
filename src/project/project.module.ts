import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/database/entities/project.entity';
import { Task } from 'src/database/entities/task.entity';

@Module({
  imports:[TypeOrmModule.forFeature(
    [Project, Task]
  ),

],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports:[ProjectService]
})
export class ProjectModule {}
