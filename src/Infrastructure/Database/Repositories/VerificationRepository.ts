import { injectable } from "tsyringe";
import { IVerificationRepository } from "@domain/Verification/IVerificationRepository";
import { VerificationSchema, type VerificationRow } from "@models/VerificationSchema";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class VerificationRepository
  extends BaseRepository<VerificationRow>
  implements IVerificationRepository
{
  constructor() {
    super(VerificationSchema);
  }
}
