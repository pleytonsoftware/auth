import { eq, and } from 'drizzle-orm';
import { OAuthAccount } from '../../domain/entities/OAuthAccount';
import { IOAuthAccountRepository } from '../../domain/repositories/IOAuthAccountRepository';
import { Database } from '../database/connection';
import { oauthAccounts, OAuthAccountSchema } from '../database/schema';

export class OAuthAccountRepository implements IOAuthAccountRepository {
  constructor(private db: Database) {}

  async create(account: OAuthAccount): Promise<OAuthAccount> {
    const accountRecord: typeof oauthAccounts.$inferInsert = {
      id: account.id,
      userId: account.userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.expiresAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    await this.db.insert(oauthAccounts).values(accountRecord);
    return account;
  }

  async findById(id: string): Promise<OAuthAccount | null> {
    const result = await this.db.query.oauthAccounts.findFirst({
      where: eq(oauthAccounts.id, id),
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByProviderAndAccountId(
    provider: string,
    providerAccountId: string
  ): Promise<OAuthAccount | null> {
    const result = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId)
      ),
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByUserId(userId: string): Promise<OAuthAccount[]> {
    const results = await this.db.query.oauthAccounts.findMany({
      where: eq(oauthAccounts.userId, userId),
    });

    return results.map((result) => this.mapToEntity(result));
  }

  async update(account: OAuthAccount): Promise<OAuthAccount> {
    await this.db
      .update(oauthAccounts)
      .set({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.expiresAt,
        updatedAt: account.updatedAt,
      })
      .where(eq(oauthAccounts.id, account.id));

    return account;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(oauthAccounts).where(eq(oauthAccounts.id, id));
  }

  private mapToEntity(schema: OAuthAccountSchema): OAuthAccount {
    return new OAuthAccount(
      schema.id,
      schema.userId,
      schema.provider,
      schema.providerAccountId,
      schema.accessToken,
      schema.refreshToken,
      schema.expiresAt,
      schema.createdAt,
      schema.updatedAt
    );
  }
}
