import { inject, injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import type { IAccountRepository } from "@domain/Account/IAccountRepository";
import type { AccountEntity } from "@domain/Account/AccountEntity";
import { Result } from "@application/Shared/Result";
import { generateId } from "@application/Shared/SharedUtils";
import { SetPasswordDto } from "./AccountDto";

const CREDENTIAL_PROVIDER_ID = "credential";
const BCRYPT_ROUNDS = 10;

@injectable()
export class AccountService {
  constructor(
    @inject("IAccountRepository")
    private readonly accountRepository: IAccountRepository
  ) {}

  async setPassword(dto: SetPasswordDto): Promise<Result> {
    const existingCredential: AccountEntity | null = await this.accountRepository.fetch({
      userId: dto.userId,
      providerId: CREDENTIAL_PROVIDER_ID,
    });

    if (existingCredential?.password) {
      return Result.error({
        message:
          "Account already has a password set. Use change password instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.upsertCredential(dto, existingCredential, hashedPassword);

    return Result.ok({});
  }

  private async upsertCredential(
    dto: SetPasswordDto,
    existingCredential: AccountEntity | null,
    hashedPassword: string
  ): Promise<void> {
    if (existingCredential) {
      await this.accountRepository.edit(
        { id: existingCredential.id },
        { password: hashedPassword }
      );
      return;
    }

    await this.accountRepository.create({
      id: generateId(),
      userId: dto.userId,
      accountId: dto.email,
      providerId: CREDENTIAL_PROVIDER_ID,
      password: hashedPassword,
    });
  }
}
