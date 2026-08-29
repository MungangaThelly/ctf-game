import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      phone?: string | null;
      isPaid: boolean;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string | null;
    phone?: string | null;
    isPaid: boolean;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string | null;
    phone?: string | null;
    isPaid?: boolean;
    isAdmin?: boolean;
  }
}
