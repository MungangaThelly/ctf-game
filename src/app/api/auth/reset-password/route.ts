import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/account-tokens';
import { checkRateLimit, requestIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  if (!checkRateLimit(`reset:${requestIp(request)}`, 10, 15 * 60_000).allowed) return Response.json({ error: 'Too many requests' }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== 'string' || typeof body?.password !== 'string' || body.password.length < 12 || body.password.length > 128) {
    return Response.json({ error: 'Invalid token or password' }, { status: 400 });
  }
  const record = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!record || record.purpose !== 'reset' || record.expiresAt <= new Date()) return Response.json({ error: 'Reset link is invalid or expired' }, { status: 400 });
  const password = await bcrypt.hash(body.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password } }),
    prisma.emailToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return Response.json({ message: 'Password updated' });
}
