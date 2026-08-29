import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/account-email';
import { checkRateLimit, requestIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  if (!checkRateLimit(`verify:${requestIp(request)}`, 5, 15 * 60_000).allowed) return Response.json({ error: 'Too many requests' }, { status: 429 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
  const user = email ? await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, emailVerified: true } }) : null;
  if (user && !user.emailVerified) await sendVerificationEmail(user).catch((error) => console.error('Verification email failed:', error));
  return Response.json({ message: 'If verification is needed, a new link has been sent.' });
}
