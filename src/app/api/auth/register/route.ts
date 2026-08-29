import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, requestIp } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/account-email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(`register:${requestIp(req)}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Too many registration attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const body = await req.json();
    const { email, username, password, confirmPassword, name, isAdmin } = body;

    // Validate input
    if (!email || !username || !password || !confirmPassword) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || email.length > 254) {
      return Response.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
      return Response.json(
        { error: 'Username must be 3-32 characters using letters, numbers, _ or -' },
        { status: 400 }
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

    if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return Response.json(
        { error: 'Password must be between 12 and 128 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
        email: email.toLowerCase(),
        username: username.trim(),
        password: hashedPassword,
        name: name || username,
        emailVerified: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? null : new Date(),
      },
    });

    const verificationSent = user.emailVerified ? false : await sendVerificationEmail({ id: user.id, email: user.email })
      .then(() => true)
      .catch((error) => { console.error('Verification email failed:', error); return false; });

    return Response.json(
      {
        message: verificationSent ? 'Account created. Check your email to verify it.' : 'Account created successfully.',
        verificationSent,
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
