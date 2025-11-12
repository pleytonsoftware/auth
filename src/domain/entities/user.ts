export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public emailVerified: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    id: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): User {
    return new User(
      id,
      email,
      password,
      firstName,
      lastName,
      false,
      new Date(),
      new Date()
    );
  }

  updateEmail(email: string): void {
    this.email = email;
    this.emailVerified = false;
    this.updatedAt = new Date();
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  updatePassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }

  updateProfile(firstName: string, lastName: string): void {
    this.firstName = firstName;
    this.lastName = lastName;
    this.updatedAt = new Date();
  }
}
