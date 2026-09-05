export interface SetPasswordDto {
  userId: string;
  email: string;
  password: string;
}

export class SetPasswordDto {
  private constructor(body: any) {
    this.userId = body.userId;
    this.email = body.email;
    this.password = body.password;
  }

  static create(body: any): SetPasswordDto {
    return new SetPasswordDto(body);
  }
}
