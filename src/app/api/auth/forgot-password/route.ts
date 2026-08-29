import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/account-email';
import { checkRateLimit, requestIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const limited = checkRateLimit(`forgot:${requestIp(request)}`, 5, 15 * 60_000);
  if (!limited.allowed) return Response.json({ error: 'Too many requests' }, { status: 429 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
  const user = email ? await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } }) : null;
  if (user) await sendPasswordResetEmail(user, body?.locale === 'fr' ? 'fr' : 'en').catch((error) => console.error('Reset email failed:', error));
  return Response.json({ message: 'If the account exists, a reset link has been sent.' });
}
