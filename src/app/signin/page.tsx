'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SignInPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('guest@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res && res.error) {
      alert('Sign in failed: ' + res.error);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-gray-900 rounded">
          <div className="text-green-300 mb-4">Signed in as {session.user?.name || session.user?.email}</div>
          <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 rounded">
            Sign out
          </button>
          <div className="mt-4">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignIn} className="p-6 bg-gray-900 rounded w-96">
        <h2 className="text-2xl text-green-400 mb-4">Sign In</h2>
        <label className="block text-sm text-green-300 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-3 bg-black text-green-300 rounded" />
        <label className="block text-sm text-green-300 mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 bg-black text-green-300 rounded" />
        <button className="w-full bg-green-400 text-black p-2 rounded" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="text-sm text-green-300 mt-3">Test accounts: <strong>guest@example.com/password</strong>, <strong>admin@example.com/secret</strong></div>
      </form>
    </div>
  );
}
