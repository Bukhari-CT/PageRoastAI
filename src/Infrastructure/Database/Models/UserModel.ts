import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class UserModel {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  firstName!: string;

  @Column({ type: "text" })
  lastName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "boolean", default: false })
  emailVerified!: boolean;

  @Column({ type: "text", nullable: true })
  image!: string | null;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @Column({ type: "text", nullable: true })
  package!: string | null;

  @CreateDateColumn({
    type: "datetime",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP(3)",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP(3)",
    onUpdate: "CURRENT_TIMESTAMP(3)",
  })
  updatedAt!: Date;
}
