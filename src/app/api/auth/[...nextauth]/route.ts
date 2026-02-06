import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({ where: { username: credentials.username } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, username: user.username, isPaid: user.isPaid };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // propagate custom flags into token
        token.username = user.username;
        token.isPaid = user.isPaid ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { ...session.user, username: token.username, isPaid: token.isPaid };
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret'
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
