import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session || session.user?.email !== 'admin@example.com') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { isBlocked } = await request.json();
    
    // Prevent admin from blocking themselves
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (user?.email === 'admin@example.com') {
      return Response.json({ error: 'Cannot block admin account' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isBlocked },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        isPaid: true,
        isBlocked: true,
        createdAt: true,
      }
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session || session.user?.email !== 'admin@example.com') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Prevent admin from deleting themselves
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (user?.email === 'admin@example.com') {
      return Response.json({ error: 'Cannot delete admin account' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return Response.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
