import { container } from "./Container";
import { AccountService } from "@application/Account/AccountService";
import { UserRepository } from "@repositories/UserRepository";

export const accountService = container.resolve(AccountService);
export const userRepository = container.resolve(UserRepository);
