import {
  ICreateRepository,
  IModifyRepository,
  IReadRepository,
} from "@domain/Shared/IBaseRepository";

export interface IAccountRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {}
