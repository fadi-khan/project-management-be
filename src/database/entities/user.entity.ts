import { UserRole } from "src/enums/UserType";
import { Column, Entity, OneToMany } from "typeorm";
import { Base } from "./base.entity";
import { Project } from "./project.entity";
import { Task } from "./task.entity";

@Entity("users")
export class User extends Base {

    @Column({ default: "Unknown" })
    name?: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.MEMBER

    })
    role: UserRole;

    // hashed refresh token (nullable) 
    @Column({ type: 'text', nullable: true })
    refreshToken: string | null;

  

    @OneToMany(() => Project, (project) => project.createdBy)
    createdProjects: Project[];

    @OneToMany(() => Task, (task) => task.assignedTo)
    assignedTasks: Task[];
}
