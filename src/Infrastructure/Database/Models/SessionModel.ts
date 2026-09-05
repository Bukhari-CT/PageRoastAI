import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import type { UserModel } from "./UserModel";

@Entity("sessions")
export class SessionModel {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  token!: string;

  @Column({ type: "datetime", precision: 3 })
  expiresAt!: Date;

  @Column({ type: "text", nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

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

  @ManyToOne("UserModel", {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: UserModel;
}
