import { injectable } from "tsyringe";
import { IAccountRepository } from "@domain/Account/IAccountRepository";
import type { AccountModel } from "@models/AccountModel";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class AccountRepository
  extends BaseRepository<AccountModel>
  implements IAccountRepository
{
  constructor() {
    super("AccountModel");
  }
}
