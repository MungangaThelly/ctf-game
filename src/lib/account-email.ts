import { prisma } from '@/lib/prisma';
import { createAccountToken } from '@/lib/account-tokens';
import { sendEmail } from '@/lib/email';

async function issue(userId: string, purpose: 'verify' | 'reset', hours: number) {
  const generated = createAccountToken(hours);
  await prisma.$transaction([
    prisma.emailToken.deleteMany({ where: { userId, purpose } }),
    prisma.emailToken.create({ data: { userId, purpose, tokenHash: generated.tokenHash, expiresAt: generated.expiresAt } }),
  ]);
  return generated.token;
}

export async function sendVerificationEmail(user: { id: string; email: string }) {
  const token = await issue(user.id, 'verify', 24);
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Security Showdown account',
    text: `Verify your account: ${url}`,
    html: `<p>Welcome to Security Showdown.</p><p><a href="${url}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(user: { id: string; email: string }, locale = 'en') {
  const token = await issue(user.id, 'reset', 1);
  const url = `${process.env.NEXTAUTH_URL}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your Security Showdown password',
    text: `Reset your password: ${url}`,
    html: `<p><a href="${url}">Reset your password</a></p><p>This link expires in one hour. Ignore it if you did not request a reset.</p>`,
  });
}
