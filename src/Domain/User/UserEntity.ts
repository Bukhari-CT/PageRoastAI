export interface IUserEntity {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isAdmin: boolean;
  package: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity extends IUserEntity {}

export class UserEntity {
  constructor(body: Partial<IUserEntity>) {
    this.id = body.id as string;
    this.firstName = body.firstName as string;
    this.lastName = body.lastName as string;
    this.name = body.name as string;
    this.email = body.email
      ? body.email.trim().toLowerCase()
      : (body.email as string);
    this.emailVerified = body.emailVerified ?? false;
    this.image = body.image ?? null;
    this.isAdmin = body.isAdmin ?? false;
    this.package = body.package ?? null;
    this.createdAt = body.createdAt as Date;
    this.updatedAt = body.updatedAt as Date;
  }

  static create(body: Partial<IUserEntity>): UserEntity {
    return new UserEntity(body);
  }
}
