import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
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

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, username: user.username, isPaid: user.isPaid };
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
      }
      return token;
    },
    async session({ session, token }) {
      // Check if user is blocked on every session check
      if (token.email) {
        const user = await prisma.user.findUnique({ 
          where: { email: token.email as string },
          select: { isBlocked: true }
        });
        
        if (user?.isBlocked) {
          // Return null to invalidate the session
          throw new Error('Your account has been blocked. Please contact support.');
        }
      }
      
      session.user = { ...session.user, id: token.id, email: token.email, username: token.username, isPaid: token.isPaid };
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret'
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
