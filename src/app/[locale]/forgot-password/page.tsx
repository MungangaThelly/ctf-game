'use client';

import { FormEvent, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) });
    const data = await response.json();
    setMessage(data.message || data.error);
  }

  return <div className="min-h-screen flex items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded border border-green-400/20 bg-slate-900 p-8">
    <h1 className="text-2xl font-bold text-green-400">Reset your password</h1>
    <p className="text-sm text-gray-400">Enter your account email. The response is intentionally the same whether an account exists or not.</p>
    <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded bg-slate-800 p-3 text-white" placeholder="you@example.com" />
    <button className="w-full rounded bg-green-600 p-3 font-semibold text-white">Send reset link</button>
    {message && <p className="text-sm text-green-300">{message}</p>}
    <Link href={`/${locale}/signin`} className="block text-center text-sm text-green-400 hover:underline">Back to sign in</Link>
  </form></div>;
}
