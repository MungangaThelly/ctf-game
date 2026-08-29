'use client';

import { FormEvent, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const data = await response.json();
    setSuccess(response.ok);
    setMessage(data.message || data.error);
  }

  return <div className="min-h-screen flex items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded border border-green-400/20 bg-slate-900 p-8">
    <h1 className="text-2xl font-bold text-green-400">Choose a new password</h1>
    <input type="password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded bg-slate-800 p-3 text-white" placeholder="At least 12 characters" />
    <button disabled={!token} className="w-full rounded bg-green-600 p-3 font-semibold text-white disabled:opacity-50">Update password</button>
    {message && <p className={`text-sm ${success ? 'text-green-300' : 'text-red-300'}`}>{message}</p>}
    {success && <Link href={`/${locale}/signin`} className="block text-center text-green-400 hover:underline">Sign in</Link>}
  </form></div>;
}
