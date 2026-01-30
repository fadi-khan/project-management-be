import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Task } from '../database/entities/task.entity';
import { UserRole } from 'src/enums/UserType';
import { Request } from 'express';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = this.taskRepository.create(createTaskDto);
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new BadRequestException("Failed to create the task !")
    }
  }

  async findAll(filters: FilterTaskDto, req: Request) {
    try {
      const queryBuilder = this.taskRepository.createQueryBuilder('task')
        .leftJoinAndSelect('task.project', 'project')
        .leftJoinAndSelect('task.assignedTo', 'assignedTo');


      if (req.user?.role === UserRole.MEMBER) {
        queryBuilder.andWhere('task.assignedToId = :userId', { userId: req.user.sub });
      } 
      else if (filters.assignedTo) {
        queryBuilder.andWhere('task.assignedToId = :assignedTo', { assignedTo: filters.assignedTo });
      }

      if (filters.status) {
        queryBuilder.andWhere('task.status = :status', { status: filters.status });
      }

      if (filters.priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
      }

      if (filters.projectId) {
        queryBuilder.andWhere('task.projectId = :projectId', { projectId: filters.projectId });
      }


      const limit = Number(filters.limit) || 10;
      const page = Number(filters.page) || 1;
      const skip = (page - 1) * limit;

      const [data, total] = await queryBuilder
        .orderBy('task.createdAt', 'DESC')
        .take(limit)
        .skip(skip)
        .getManyAndCount();

      if (data.length < 1) {
        throw new NotFoundException("No tasks found !");
      }
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        message: "Tasks retrieved successfully"
      };

    } catch (error) {
      console.error('Task Fetch Error:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.taskRepository.findOne({
        where: { id },
        relations: ['project', 'assignedTo'],
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      await this.taskRepository.update(id, updateTaskDto);
      return this.findOne(id);
    } catch (error) {
      throw new NotFoundException("Task not found !");
    }
  }

  async remove(id: number) {
    try {
      return await this.taskRepository.delete(id);
    } catch (error) {
      throw new NotFoundException("Task not found !");
    }
  }
}
