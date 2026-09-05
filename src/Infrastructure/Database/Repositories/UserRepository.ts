import { injectable } from "tsyringe";
import { IUserRepository } from "@domain/User/IUserRepository";
import type { UserModel } from "@models/UserModel";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class UserRepository
  extends BaseRepository<UserModel>
  implements IUserRepository
{
  constructor() {
    super("UserModel");
  }
}
