export class OAuthAccount {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public provider: string,
    public providerAccountId: string,
    public accessToken: string | null,
    public refreshToken: string | null,
    public expiresAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    provider: string,
    providerAccountId: string,
    accessToken: string | null = null,
    refreshToken: string | null = null,
    expiresAt: Date | null = null
  ): OAuthAccount {
    return new OAuthAccount(
      id,
      userId,
      provider,
      providerAccountId,
      accessToken,
      refreshToken,
      expiresAt,
      new Date(),
      new Date()
    );
  }

  updateTokens(
    accessToken: string | null,
    refreshToken: string | null,
    expiresAt: Date | null
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.updatedAt = new Date();
  }
}
