import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rate-limit';
import { createAccountToken, hashToken } from './account-tokens';

describe('checkRateLimit', () => {
  it('allows requests up to the limit and then blocks', () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});

describe('account tokens', () => {
  it('stores only a deterministic hash of a random token', () => {
    const generated = createAccountToken(1);
    expect(generated.token).not.toBe(generated.tokenHash);
    expect(hashToken(generated.token)).toBe(generated.tokenHash);
    expect(generated.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('generates unique tokens', () => {
    expect(createAccountToken(1).token).not.toBe(createAccountToken(1).token);
  });
});
