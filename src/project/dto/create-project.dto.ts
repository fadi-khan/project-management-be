import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from 'src/enums/ProjectStatus';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;
}
