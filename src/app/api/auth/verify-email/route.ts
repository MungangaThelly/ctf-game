import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/account-tokens';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const destination = new URL('/en/signin', process.env.NEXTAUTH_URL || request.url);
  if (!token) { destination.searchParams.set('verified', 'invalid'); return Response.redirect(destination); }

  const record = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.purpose !== 'verify' || record.expiresAt <= new Date()) {
    destination.searchParams.set('verified', 'invalid');
    return Response.redirect(destination);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailToken.deleteMany({ where: { userId: record.userId, purpose: 'verify' } }),
  ]);
  destination.searchParams.set('verified', 'true');
  return Response.redirect(destination);
}
