import { createHash, randomBytes } from 'crypto';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function createAccountToken(hoursValid: number) {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + hoursValid * 3_600_000) };
}
