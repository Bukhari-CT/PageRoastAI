import { injectable } from "tsyringe";
import { ISessionRepository } from "@domain/Session/ISessionRepository";
import type { SessionModel } from "@models/SessionModel";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class SessionRepository
  extends BaseRepository<SessionModel>
  implements ISessionRepository
{
  constructor() {
    super("SessionModel");
  }
}
