import { injectable } from "tsyringe";
import { IUserRepository } from "@domain/User/IUserRepository";
import { UserSchema, type UserRow } from "@models/UserSchema";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class UserRepository
  extends BaseRepository<UserRow>
  implements IUserRepository
{
  constructor() {
    super(UserSchema);
  }
}
