import { injectable } from "tsyringe";
import { ISessionRepository } from "@domain/Session/ISessionRepository";
import { SessionSchema, type SessionRow } from "@models/SessionSchema";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class SessionRepository
  extends BaseRepository<SessionRow>
  implements ISessionRepository
{
  constructor() {
    super(SessionSchema);
  }
}
