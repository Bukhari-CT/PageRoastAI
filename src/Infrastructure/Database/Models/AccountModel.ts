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

@Entity("accounts")
@Index(["providerId", "accountId"], { unique: true })
export class AccountModel {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  accountId!: string;

  @Column({ type: "varchar", length: 255 })
  providerId!: string;

  @Column({ type: "text", nullable: true })
  accessToken!: string | null;

  @Column({ type: "text", nullable: true })
  refreshToken!: string | null;

  @Column({ type: "datetime", precision: 3, nullable: true })
  accessTokenExpiresAt!: Date | null;

  @Column({ type: "datetime", precision: 3, nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @Column({ type: "text", nullable: true })
  scope!: string | null;

  @Column({ type: "text", nullable: true })
  idToken!: string | null;

  @Column({ type: "text", nullable: true })
  password!: string | null;

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
