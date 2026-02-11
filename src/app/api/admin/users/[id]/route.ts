import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });

  if (!currentUser?.isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const { isBlocked } = await request.json();
    
    // Prevent admin from blocking themselves or other admins
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: { email: true, isAdmin: true }
    });
    
    if (user?.isAdmin) {
      return Response.json({ error: 'Cannot block admin accounts' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });

  if (!currentUser?.isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Prevent deleting admin accounts
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: { isAdmin: true }
    });
    
    if (user?.isAdmin) {
      return Response.json({ error: 'Cannot delete admin accounts' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return Response.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
