import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Base } from "./base.entity";
import { ProjectStatus } from "src/enums/ProjectStatus";
import { Task } from "./task.entity";
import { User } from "./user.entity";

@Entity("projects")
export class Project extends Base {

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    description: string

    @Column({
        nullable: false,
        enum: ProjectStatus,
        default: ProjectStatus.ARCHIVED
    })
    status: ProjectStatus


    @ManyToOne(() => User, (user) => user.createdProjects)
    createdBy: User;

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];
}
