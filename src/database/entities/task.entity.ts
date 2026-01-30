import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "./base.entity";
import { TaskStatus } from "src/enums/TastkStatus";
import { TaskPriority } from "src/enums/TaskPriority";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity("tasks")
export class Task extends Base {

    @Column()
    title: string

    @Column()
    description: string

    @Column(
        {
            enum: TaskStatus,
            default: TaskStatus.TODO
        })
    status?: TaskStatus

    @Column(
        {
            enum: TaskPriority,
            default: TaskPriority.LOW
        }
    )
    priority?: TaskPriority

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date;


    @Column()
    projectId: number;

    
    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    

    @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User;

    @Column({ nullable: true })
    assignedToId: number;

}
