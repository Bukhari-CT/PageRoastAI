import { injectable } from "tsyringe";
import { Between } from "typeorm";
import type {
  IReportRepository,
  ReportHistoryOptions,
} from "@domain/Report/IReportRepository";
import type { ReportModel } from "@models/ReportModel";
import { BaseRepository } from "./BaseRepository";

/** Keeps an accidental `limit: 10000` from turning into a full table scan. */
export const MAX_HISTORY_LIMIT = 100;
export const DEFAULT_HISTORY_LIMIT = 20;

@injectable()
export class ReportRepository
  extends BaseRepository<ReportModel>
  implements IReportRepository
{
  constructor() {
    super("ReportModel");
  }

  async findByUserId(
    userId: string,
    options: ReportHistoryOptions = {}
  ): Promise<ReportModel[]> {
    const limit = Math.min(options.limit ?? DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT);
    const offset = Math.max(options.offset ?? 0, 0);

    return this.fetchAll(
      { userId },
      { order: { createdAt: "DESC" }, take: limit, skip: offset }
    );
  }

  /**
   * Count of a user's reports in the half-open interval [from, to).
   *
   * Provided for Phase 2 quota enforcement; nothing calls it yet. `Between` is
   * inclusive on both ends in TypeORM, so `to` is nudged back by a millisecond
   * to keep period boundaries from double-counting a report that lands exactly
   * on the boundary of two periods.
   */
  async countByUserIdInPeriod(userId: string, from: Date, to: Date): Promise<number> {
    const repository = await this.getRepository();
    const exclusiveTo = new Date(to.getTime() - 1);

    return repository.count({
      where: { userId, createdAt: Between(from, exclusiveTo) },
    });
  }
}
