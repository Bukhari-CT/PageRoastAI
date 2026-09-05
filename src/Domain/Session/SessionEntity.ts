export interface ISessionEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionEntity extends ISessionEntity {}

export class SessionEntity {
  constructor(body: Partial<ISessionEntity>) {
    this.id = body.id as string;
    this.userId = body.userId as string;
    this.token = body.token as string;
    this.expiresAt = body.expiresAt as Date;
    this.ipAddress = body.ipAddress ?? null;
    this.userAgent = body.userAgent ?? null;
    this.createdAt = body.createdAt as Date;
    this.updatedAt = body.updatedAt as Date;
  }

  static create(body: Partial<ISessionEntity>): SessionEntity {
    return new SessionEntity(body);
  }
}
