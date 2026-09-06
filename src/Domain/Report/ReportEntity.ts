import type { RoastResult } from "@/schemas/roast";
import type { PlanId } from "@/shared/config/plans";

export interface IReportEntity {
  id: string;
  /** Null only for legacy/anonymous audits; see ReportModel.userId. */
  userId: string | null;
  url: string;
  /** Product plan the audit ran under. */
  planId: PlanId;
  score: number;
  payload: RoastResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportEntity extends IReportEntity {}

export class ReportEntity {
  constructor(body: Partial<IReportEntity>) {
    this.id = body.id as string;
    this.userId = body.userId ?? null;
    this.url = body.url as string;
    this.planId = body.planId as PlanId;
    this.score = body.score as number;
    this.payload = body.payload as RoastResult;
    this.createdAt = body.createdAt as Date;
    this.updatedAt = body.updatedAt as Date;
  }

  static create(body: Partial<IReportEntity>): ReportEntity {
    return new ReportEntity(body);
  }

  /** True when this report may be read by the given viewer. */
  isOwnedBy(userId: string | null | undefined): boolean {
    return this.userId !== null && this.userId === userId;
  }
}
