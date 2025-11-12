import { OAuthAccount } from '../entities/oauth-account';

export interface IOAuthAccountRepository {
  create(account: OAuthAccount): Promise<OAuthAccount>;
  findById(id: string): Promise<OAuthAccount | null>;
  findByProviderAndAccountId(
    provider: string,
    providerAccountId: string
  ): Promise<OAuthAccount | null>;
  findByUserId(userId: string): Promise<OAuthAccount[]>;
  update(account: OAuthAccount): Promise<OAuthAccount>;
  delete(id: string): Promise<void>;
}
