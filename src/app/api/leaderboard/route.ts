import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CHALLENGES } from '@/lib/config';
import { getAchievementBadge } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  const users = await prisma.user.findMany({
    where: { isBlocked: false, progress: { some: { completed: true } } },
    select: { id: true, username: true, progress: { where: { completed: true }, select: { points: true } } },
  });
  const ranked = users.map((user) => ({
    id: user.id,
    username: user.username,
    score: user.progress.reduce((sum, item) => sum + item.points, 0),
    completedChallenges: user.progress.length,
    totalChallenges: CHALLENGES.length,
    timeToComplete: 0,
    badge: getAchievementBadge(user.progress.length, CHALLENGES.length),
  })).sort((a, b) => b.score - a.score || b.completedChallenges - a.completedChallenges)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const [totalPlayers, exploitsFound] = await Promise.all([
    prisma.user.count({ where: { isBlocked: false } }),
    prisma.challengeProgress.count({ where: { exploited: true } }),
  ]);
  const currentUser = ranked.find((entry) => entry.id === session?.user?.id) ?? null;
  return Response.json({ leaderboard: ranked.slice(0, 50), currentUser, stats: { totalPlayers, exploitsFound } });
}
