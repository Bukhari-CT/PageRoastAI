export interface IVerificationEntity {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationEntity extends IVerificationEntity {}

export class VerificationEntity {
  constructor(body: Partial<IVerificationEntity>) {
    this.id = body.id as string;
    this.identifier = body.identifier as string;
    this.value = body.value as string;
    this.expiresAt = body.expiresAt as Date;
    this.createdAt = body.createdAt as Date;
    this.updatedAt = body.updatedAt as Date;
  }

  static create(body: Partial<IVerificationEntity>): VerificationEntity {
    return new VerificationEntity(body);
  }
}
