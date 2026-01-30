import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from 'src/enums/TastkStatus';
import { TaskPriority } from 'src/enums/TaskPriority';

export class FilterTaskDto {
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    assignedTo?: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    projectId?: number;
    
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    page?: number;
    
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    limit?: number;
}
