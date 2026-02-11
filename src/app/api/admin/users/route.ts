import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });

  if (!user?.isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        isPaid: true,
        isBlocked: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
