'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('signin');
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await signIn('credentials', { 
      email, 
      password, 
      redirect: false 
    });
    
    setLoading(false);
    
    if (res && res.error) {
      setError(t('error'));
    } else if (res?.ok) {
      router.push(`/${locale}/challenges`);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-green-400/20 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-green-400 mb-2">{t('alreadySignedIn')}</h2>
            <p className="text-gray-400 mb-6">{t('signedInAs')} {session.user?.name || session.user?.email}</p>
            
            <div className="space-y-3">
              <Link 
                href={`/${locale}/challenges`}
                className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center transition"
              >
                {t('goToChallenges')}
              </Link>
              
              <button 
                onClick={() => signOut()}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-green-400/20 text-gray-300 rounded-lg font-semibold transition"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-green-400/20 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-green-400 mb-2">{t('welcomeBack')}</h2>
          <p className="text-gray-400 mb-6">{t('subtitle')}</p>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-green-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-green-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-400/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? t('signingIn') : t('signInButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/signup`} className="text-green-400 hover:underline font-semibold">
                {t('signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

