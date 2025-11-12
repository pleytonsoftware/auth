import { eq } from 'drizzle-orm';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Database } from '../database/connection';
import { users, UserSchema } from '../database/schema';

export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async create(user: User): Promise<User> {
    const userRecord: typeof users.$inferInsert = {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await this.db.insert(users).values(userRecord);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return result ? this.mapToEntity(result) : null;
  }

  async update(user: User): Promise<User> {
    await this.db
      .update(users)
      .set({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        updatedAt: user.updatedAt,
      })
      .where(eq(users.id, user.id));

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  private mapToEntity(schema: UserSchema): User {
    return new User(
      schema.id,
      schema.email,
      schema.password,
      schema.firstName,
      schema.lastName,
      schema.emailVerified,
      schema.createdAt,
      schema.updatedAt
    );
  }
}
