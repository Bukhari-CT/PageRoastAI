import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("verifications")
export class VerificationModel {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id!: string;

  @Column({ type: "text" })
  identifier!: string;

  @Column({ type: "text" })
  value!: string;

  @Column({ type: "datetime", precision: 3 })
  expiresAt!: Date;

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
