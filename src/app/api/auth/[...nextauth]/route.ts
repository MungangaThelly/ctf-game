import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';

const authSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === 'production' && !authSecret) {
  throw new Error('NEXTAUTH_SECRET must be set in production');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        // Check if user is blocked
        if (user.isBlocked) {
          throw new Error('Your account has been blocked. Please contact support.');
        }

        if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM && !user.emailVerified) {
          throw new Error('Please verify your email before signing in.');
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, username: user.username, isPaid: user.isPaid, isAdmin: user.isAdmin };
      }
    })
  ],
  pages: {
    signIn: '/signin',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // propagate custom fields into token
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.isPaid = user.isPaid ?? false;
        token.isAdmin = user.isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // Check if user is blocked on every session check
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { isBlocked: true, isAdmin: true, isPaid: true, phone: true }
        });
        
        if (user?.isBlocked) {
          // Return null to invalidate the session
          throw new Error('Your account has been blocked. Please contact support.');
        }
        
        // Update isAdmin in token if it changed
        if (user) {
          token.isAdmin = user.isAdmin;
          token.isPaid = user.isPaid;
          token.phone = user.phone;
        }
      }
      
      session.user = {
        ...session.user,
        id: token.id ?? '',
        email: token.email,
        username: token.username,
        phone: token.phone,
        isPaid: token.isPaid ?? false,
        isAdmin: token.isAdmin ?? false,
      };
      return session;
    }
  },
  secret: authSecret
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
