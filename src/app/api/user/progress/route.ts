import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CHALLENGES, GAME_CONFIG } from '@/lib/config';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  const progress = await prisma.challengeProgress.findMany({ where: { userId: session.user.id } });
  return Response.json({ progress });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.challengeId !== 'string') return Response.json({ error: 'Invalid request' }, { status: 400 });
  const challenge = CHALLENGES.find((item) => item.id === body.challengeId);
  if (!challenge) return Response.json({ error: 'Unknown challenge' }, { status: 400 });

  const hintsUsed = Math.max(0, Math.min(3, Number.isInteger(body.hintsUsed) ? body.hintsUsed : 0));
  const multiplier = hintsUsed === 0 ? GAME_CONFIG.pointsMultiplier.noHints
    : hintsUsed === 1 ? GAME_CONFIG.pointsMultiplier.oneHint
    : hintsUsed === 2 ? GAME_CONFIG.pointsMultiplier.twoHints
    : GAME_CONFIG.pointsMultiplier.threeHints;
  const points = body.completed === true ? Math.floor(challenge.points * multiplier) : 0;
  const key = { userId_challengeId: { userId: session.user.id, challengeId: challenge.id } };
  const existing = await prisma.challengeProgress.findUnique({ where: key });
  const progress = await prisma.challengeProgress.upsert({
    where: key,
    update: {
      completed: existing?.completed || body.completed === true,
      exploited: existing?.exploited || body.exploited === true,
      hintsUsed: existing?.completed ? existing.hintsUsed : hintsUsed,
      points: Math.max(existing?.points ?? 0, points),
    },
    create: { userId: session.user.id, challengeId: challenge.id, completed: body.completed === true, exploited: body.exploited === true, hintsUsed, points },
  });
  return Response.json({ progress });
}
