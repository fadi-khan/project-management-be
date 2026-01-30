import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { TaskStatus } from 'src/enums/TastkStatus';
import { TaskPriority } from 'src/enums/TaskPriority';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @Transform(({ value }) => value ? new Date(value) : undefined)
    @IsOptional()
    dueDate?: Date;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsNotEmpty()
    projectId: number; 

    @Transform(({ value }) => (value === null || value === undefined || value === '' ? undefined : parseInt(value)))
    @IsNumber()
    @IsOptional()
    assignedToId?: number;
}
