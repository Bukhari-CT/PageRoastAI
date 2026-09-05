import {
  ICreateRepository,
  IModifyRepository,
  IReadRepository,
} from "@domain/Shared/IBaseRepository";

export interface IVerificationRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {}
