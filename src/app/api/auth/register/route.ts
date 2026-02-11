import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, confirmPassword, name, isAdmin } = body;

    // Validate input
    if (!email || !username || !password || !confirmPassword) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Prevent registration with admin email
    if (email.toLowerCase() === 'admin@example.com') {
      return Response.json(
        { error: 'This email address is reserved' },
        { status: 403 }
      );
    }
    
    // Prevent setting admin privileges through registration
    if (isAdmin === true) {
      return Response.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return Response.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || username,
      },
    });

    return Response.json(
      {
        message: 'User created successfully',
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
