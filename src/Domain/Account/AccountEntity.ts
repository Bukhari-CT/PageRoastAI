export interface IAccountEntity {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  idToken: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountEntity extends IAccountEntity {}

export class AccountEntity {
  constructor(body: Partial<IAccountEntity>) {
    this.id = body.id as string;
    this.userId = body.userId as string;
    this.accountId = body.accountId as string;
    this.providerId = body.providerId as string;
    this.accessToken = body.accessToken ?? null;
    this.refreshToken = body.refreshToken ?? null;
    this.accessTokenExpiresAt = body.accessTokenExpiresAt ?? null;
    this.refreshTokenExpiresAt = body.refreshTokenExpiresAt ?? null;
    this.scope = body.scope ?? null;
    this.idToken = body.idToken ?? null;
    this.password = body.password ?? null;
    this.createdAt = body.createdAt as Date;
    this.updatedAt = body.updatedAt as Date;
  }

  static create(body: Partial<IAccountEntity>): AccountEntity {
    return new AccountEntity(body);
  }
}
