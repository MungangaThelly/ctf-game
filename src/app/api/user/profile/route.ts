import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, phone } = await req.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
      },
    });

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
