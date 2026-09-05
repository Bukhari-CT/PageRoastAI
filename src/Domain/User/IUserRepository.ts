import {
  ICreateRepository,
  IModifyRepository,
  IReadRepository,
} from "@domain/Shared/IBaseRepository";

export interface IUserRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {}
