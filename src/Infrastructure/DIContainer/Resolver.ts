import { container } from "./Container";
import { AccountService } from "@application/Account/AccountService";
import { UserRepository } from "@repositories/UserRepository";
import { ReportRepository } from "@repositories/ReportRepository";
import { AuditRunRepository } from "@repositories/AuditRunRepository";

export const accountService = container.resolve(AccountService);
export const userRepository = container.resolve(UserRepository);
export const reportRepository = container.resolve(ReportRepository);
export const auditRunRepository = container.resolve(AuditRunRepository);
