import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "@repositories/UserRepository";
import { SessionRepository } from "@repositories/SessionRepository";
import { AccountRepository } from "@repositories/AccountRepository";
import { VerificationRepository } from "@repositories/VerificationRepository";
import { ReportRepository } from "@repositories/ReportRepository";

declare global {
  var __diContainerRegistered: boolean | undefined;
}

if (!globalThis.__diContainerRegistered) {
  container.register("IUserRepository", { useClass: UserRepository });
  container.register("ISessionRepository", { useClass: SessionRepository });
  container.register("IAccountRepository", { useClass: AccountRepository });
  container.register("IVerificationRepository", {
    useClass: VerificationRepository,
  });
  container.register("IReportRepository", { useClass: ReportRepository });
  globalThis.__diContainerRegistered = true;
}

export { container };
