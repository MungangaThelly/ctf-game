import { getServerSession } from 'next-auth/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session || session.user?.email !== 'admin@example.com') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Total users
    const totalUsers = await prisma.user.count();

    // Paid users
    const paidUsers = await prisma.user.count({
      where: { isPaid: true }
    });

    // Free users
    const freeUsers = totalUsers - paidUsers;

    // Users created in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Revenue (assuming $9.99 per paid user)
    const monthlyPrice = 9.99;
    const totalRevenue = paidUsers * monthlyPrice;
    const mrrRevenue = paidUsers * monthlyPrice; // For MVP, treat as MRR

    // User growth by week (last 8 weeks)
    const usersByWeek = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      });

      const weekLabel = `Week ${8 - i}`;
      usersByWeek.push({ week: weekLabel, users: count });
    }

    // Recent paid signups
    const recentPaidSignups = await prisma.user.findMany({
      where: { isPaid: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Conversion rate
    const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) : '0.00';

    return Response.json({
      summary: {
        totalUsers,
        paidUsers,
        freeUsers,
        newUsersLast30Days,
        conversionRate: parseFloat(conversionRate),
        totalRevenue: totalRevenue.toFixed(2),
        mrrRevenue: mrrRevenue.toFixed(2)
      },
      usersByWeek,
      recentPaidSignups
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
