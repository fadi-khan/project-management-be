import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/database/entities/project.entity';
import { Repository } from 'typeorm';
import { UserRole } from 'src/enums/UserType';
import { Task } from 'src/database/entities/task.entity';
import { ProjectStatus } from 'src/enums/ProjectStatus';
import { TaskStatus } from 'src/enums/TastkStatus';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>
  ) { }

  create(createProjectDto: CreateProjectDto , req: any) {

    try {
      const project = this.projectRepo.create({
        ...createProjectDto,
        createdBy: { id: req.user.sub }
      });
      return this.projectRepo.save(project);
    } catch (error) {
      throw new BadRequestException("Failed to create the project !");
    }
  }

async findAll(page = 1, req: any) {
  const LIMIT = 5;
  const offset = (page - 1) * LIMIT;

  const { sub: userId, role } = req.user;
  const isAdmin = role === UserRole.ADMIN;

  try {
    const [
      completedProjects,
      completedTasks,
      totalTasks,
    ] = await Promise.all([
      this.projectRepo.count({
        where: isAdmin
          ? { status: ProjectStatus.COMPLETED }
          : { createdBy: { id: userId }, status: ProjectStatus.COMPLETED },
      }),

      this.taskRepo.count({
        where: isAdmin
          ? { status: TaskStatus.DONE }
          : { assignedTo: { id: userId }, status: TaskStatus.DONE },
      }),

      this.taskRepo.count({
        where: isAdmin
          ? {}
          : { assignedTo: { id: userId } },
      }),
    ]);

    const queryBuilder = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdBy', 'createdBy')
      .orderBy('project.createdAt', 'DESC')
      .skip(offset)
      .take(LIMIT);

    if (!isAdmin) {
      queryBuilder
        .innerJoin('project.tasks', 'task')
        .andWhere('task.assignedToId = :userId', { userId });
    }

    const [projects, total] = await queryBuilder.getManyAndCount();

    return {
      stats: {
        totalProjects: total,
        completedProjects,
        completedTasks,
        totalTasks,
      },
      data: projects,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / LIMIT),
        limit: LIMIT,
      },
      message: 'Projects fetched successfully!',
    };
  } catch (error) {
    console.error('Dashboard Fetch Error:', error);
    throw error; 
  }
}


  async findOne(id: number) {

    try {
      return await this.projectRepo.findOne({ where: { id: id } })
    } catch (error) {
      throw new NotFoundException("Project not found !")
    }

  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    
    try {
      await this.projectRepo.update(id,updateProjectDto)
    } catch (error) {
      throw new BadRequestException("Invalid data please try again !")
    }
  }

  async remove(id: number) {
    try {
      await this.projectRepo.delete(id);
    } catch (error) {
      throw new BadRequestException("Failed to delete project !");
    }
  }
}

