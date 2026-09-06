import { injectable } from "tsyringe";
import { IAccountRepository } from "@domain/Account/IAccountRepository";
import { AccountSchema, type AccountRow } from "@models/AccountSchema";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class AccountRepository
  extends BaseRepository<AccountRow>
  implements IAccountRepository
{
  constructor() {
    super(AccountSchema);
  }
}
