'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { gameStore } from '@/store/gameStore';
import { isValidRedirectUrl } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

export default function OpenRedirectChallenge() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('openRedirect');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loginAttempts, setLoginAttempts] = useState<{ message: string; rejected: boolean }[]>([]);
  const [exploited, setExploited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isPaid === false) {
      return;
    }

    // Check if already completed
    const state = gameStore.getGameState();
    setCompleted(state.completedChallenges.includes('open-redirect-login'));
    setExploited(state.exploitedChallenges.includes('open-redirect-login'));

    // Set default redirect URL from query params (vulnerable!)
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || '/dashboard';
    setRedirectUrl(redirect);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-300 font-mono">
        {t('loading')}
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-gray-900 rounded text-center">
          <div className="text-green-300 mb-4 font-mono">{t('signInRequired')}</div>
          <button
            onClick={() => signIn(undefined, { callbackUrl: `/${locale}/challenges/open-redirect-login` })}
            className="px-4 py-2 bg-green-400 text-black rounded font-mono"
          >
            {t('signIn')}
          </button>
          <div className="mt-4">
            <Link href={`/${locale}/challenges`} className="text-green-300 hover:underline font-mono">
              {t('backToChallenges')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session?.user?.isPaid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-gray-900 rounded text-center">
          <div className="text-yellow-300 mb-4 font-mono">{t('premiumLocked')}</div>
          <Link href={`/${locale}/pricing`} className="px-4 py-2 bg-yellow-500 text-black rounded font-mono">
            {t('upgradeNow')}
          </Link>
          <div className="mt-4">
            <Link href={`/${locale}/challenges`} className="text-green-300 hover:underline font-mono">
              {t('backToChallenges')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Simulate login process
    if (username && password) {
      // SECURE: Validate redirect URL against whitelist (relative paths only)
      const allowedDomains = ['localhost', window.location.hostname];
      const isValidRedirect = isValidRedirectUrl(redirectUrl, allowedDomains);
      
      if (isValidRedirect) {
        setLoginAttempts(prev => [...prev, 
          { message: t('loginAttemptSafe', { timestamp, username, redirectUrl }), rejected: false }
        ]);
        alert(t('loginSuccessAlert'));
      } else {
        // Reject external or malicious redirects
        setLoginAttempts(prev => [...prev, 
          { message: t('loginAttemptRejected', { timestamp, username, redirectUrl }), rejected: true }
        ]);
        alert(t('loginRejectedAlert'));
      }
    } else {
      alert(t('missingCredentialsAlert'));
    }
  };

  const completeChallenge = () => {
    const points = gameStore.completeChallenge('open-redirect-login', hintsUsed);
    setCompleted(true);
    alert(t('completionAlert', { points }));
  };

  const useHint = () => {
    const hints = [
      t('hint1'),
      t('hint2'),
      t('hint3')
    ];
    
    if (hintsUsed < hints.length) {
      setHintsUsed(hintsUsed + 1);
      alert(t('hintAlert', { number: hintsUsed + 1, hint: hints[hintsUsed] }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}/challenges`} className="text-green-400 hover:text-green-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-mono font-bold neon-glow text-green-400">
                {t('title')}
              </h1>
              <p className="text-green-300/80 text-sm">{t('subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploited && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono">{t('exploited')}</span>
              </div>
            )}
            {completed && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-mono">{t('completed')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Challenge Environment */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <h2 className="text-xl font-mono text-green-400 mb-4">{t('portalTitle')}</h2>
              
              {/* Vulnerable Login Form */}
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg">
                <h3 className="text-xl text-white mb-4">{t('welcomeBack')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      {t('username')}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                      placeholder={t('usernamePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      {t('password')}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                      placeholder={t('passwordPlaceholder')}
                    />
                  </div>

                  {/* Visible redirect parameter (vulnerability!) */}
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      {t('redirectAfterLogin')}
                      <span className="text-yellow-400 ml-2">{t('debugMode')}</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                        className="flex-1 p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none font-mono text-sm"
                        placeholder={t('redirectPlaceholder')}
                      />
                      <ExternalLink className="w-10 h-10 p-2 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {t('debugNotice')}
                    </p>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    {t('signInButton')}
                  </button>
                </div>
              </div>
            </div>

            {/* Challenge Controls */}
            <div className="terminal p-4 rounded-lg">
              <div className="flex space-x-3">
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= 3}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded font-mono text-sm"
                >
                  {t('useHint', { used: hintsUsed })}
                </button>
                
                {exploited && !completed && (
                  <button
                    onClick={completeChallenge}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono text-sm"
                  >
                    {t('completeChallenge')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <h3 className="text-lg font-mono text-green-400 mb-4">{t('securityAnalysis')}</h3>
              
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-400 p-4 rounded">
                  <h4 className="font-mono text-red-400 mb-2">{t('vulnerabilityTitle')}</h4>
                  <p className="text-red-300 text-sm">{t('vulnerabilityDescription')}</p>
                </div>

                <div className="bg-orange-900/20 border border-orange-400 p-4 rounded">
                  <h4 className="font-mono text-orange-400 mb-2">{t('attackScenario')}</h4>
                  <div className="text-orange-300 text-sm space-y-2">
                    <p>{t('scenarioStep1')}</p>
                    <p>{t('scenarioStep2')}</p>
                    <p>{t('scenarioStep3')}</p>
                    <p>{t('scenarioStep4')}</p>
                  </div>
                </div>

                {/* Vulnerable Code Example */}
                <div className="vulnerable-code">
                  <div className="text-red-400 text-xs font-bold mb-2">{t('vulnerableCodeLabel')}</div>
                  <pre className="text-green-300 text-xs overflow-x-auto">
{`// No validation on redirect URL!
const redirect = req.query.redirect;
res.redirect(redirect); // ❌ DANGEROUS!

// Safe version would be:
const allowedDomains = ['myapp.com'];
if (isValidDomain(redirect, allowedDomains)) {
  res.redirect(redirect); // ✅ SAFE
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Login Attempts Log */}
            {loginAttempts.length > 0 && (
              <div className="terminal p-6 rounded-lg">
                <h3 className="text-lg font-mono text-green-400 mb-4">{t('loginActivity')}</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loginAttempts.map((attempt, index) => (
                    <div 
                      key={index}
                      className={`font-mono text-xs p-2 rounded ${
                        attempt.rejected
                          ? 'bg-red-900/20 text-red-300 border border-red-400'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {attempt.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}