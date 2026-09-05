import {
  ICreateRepository,
  IModifyRepository,
  IReadRepository,
} from "@domain/Shared/IBaseRepository";

export interface ReportHistoryOptions {
  limit?: number;
  offset?: number;
}

export interface IReportRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {
  /**
   * Most recent reports for one user, newest first.
   */
  findByUserId(userId: string, options?: ReportHistoryOptions): Promise<unknown[]>;

  /**
   * Reports a user created within a half-open interval [from, to).
   *
   * Exists so Phase 2 can enforce the Free (1 audit) and Pro (30 audits per
   * period) allowances without reaching around the repository. It is not
   * called by any quota logic yet.
   */
  countByUserIdInPeriod(userId: string, from: Date, to: Date): Promise<number>;
}
