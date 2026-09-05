import {
  ICreateRepository,
  IModifyRepository,
  IReadRepository,
} from "@domain/Shared/IBaseRepository";

export interface ISessionRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {}
