import { injectable } from "tsyringe";
import { IVerificationRepository } from "@domain/Verification/IVerificationRepository";
import type { VerificationModel } from "@models/VerificationModel";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class VerificationRepository
  extends BaseRepository<VerificationModel>
  implements IVerificationRepository
{
  constructor() {
    super("VerificationModel");
  }
}
