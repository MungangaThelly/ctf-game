'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Key, Shield, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { gameStore } from '@/store/gameStore';
import { createMockJWT, decodeMockJWT } from '@/lib/utils';
import jwtDecode from 'jwt-decode';
import { useLocale, useTranslations } from 'next-intl';
export default function JWTManipulationChallenge() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('jwtManipulation');
  const [currentUser, setCurrentUser] = useState('guest');
  const [jwtToken, setJwtToken] = useState('');
  const [editedToken, setEditedToken] = useState('');
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exploitDetected, setExploitDetected] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isPaid === false) {
      router.push(`/${locale}/pricing`);
      return;
    }

    // Initialize with a guest token
    const guestPayload = {
      sub: 'user_123',
      username: 'guest',
      role: 'user',
      admin: false,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = createMockJWT(guestPayload);
    setJwtToken(token);
    setEditedToken(token);
    
    // Check if challenge was already completed
    const state = gameStore.getGameState();
    setChallengeCompleted(state.completedChallenges.includes('jwt-manipulation'));
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
             onClick={() => signIn(undefined, { callbackUrl: `/${locale}/challenges/jwt-manipulation` })}
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

  const handleLogin = (username: string, password: string) => {
    // Simulate login (any password works for demo)
    const payload = {
      sub: `user_${Date.now()}`,
      username: username,
      role: username === 'admin' ? 'admin' : 'user',
      admin: username === 'admin',
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = createMockJWT(payload);
    setJwtToken(token);
    setEditedToken(token);
    setCurrentUser(username);
    setIsAdmin(username === 'admin');
  };

  const handleTokenEdit = (newToken: string) => {
    setEditedToken(newToken);
    
    // Try to decode the edited token
    const decoded = decodeMockJWT(newToken);
    setDecodedToken(decoded);
    
    if (decoded && decoded.payload) {
      // SECURE: Validate token signature before trusting payload
      // Only grant admin access if the original token (from login) is valid
      // Reject manipulated tokens by checking signature integrity
      const isTokenValid = newToken === jwtToken; // Token must match original
      const isNowAdmin = decoded.payload.admin === true || decoded.payload.role === 'admin';
      
      if (isNowAdmin && isTokenValid && currentUser === 'admin') {
        // Only the actual admin can access admin functions
        setExploitDetected(false);
        setIsAdmin(true);
      } else if (isNowAdmin && !isTokenValid) {
        // Token was manipulated; reject it
        alert(t('invalidSignatureAlert'));
      } else if (isNowAdmin && currentUser !== 'admin') {
        // Non-admin users cannot become admin via token manipulation
        alert(t('authorizationFailedAlert'));
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
               href={`/${locale}/challenges`}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
             <h1 className="text-2xl font-mono font-bold neon-glow">
               {t('title')}
             </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploitDetected && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                 <span className="font-mono text-sm">{t('privilegeEscalated')}</span>
              </div>
            )}
            {challengeCompleted && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                 <span className="font-mono text-sm">{t('completed')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* Challenge Description */}
        <div className="terminal p-6 rounded-lg mb-6">
           <h2 className="text-lg font-mono text-green-400 mb-4">{t('missionBriefing')}</h2>
          <div className="space-y-2 text-green-300 font-mono text-sm">
             <p>{t('briefingLine1')}</p>
             <p>{t('briefingLine2')}</p>
             <p>{t('briefingLine3')}</p>
             <p className="text-orange-400">{t('briefingWarning')}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Login Simulation */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Key className="w-6 h-6 text-blue-400" />
                 <h2 className="text-xl font-mono text-green-400">{t('authSystem')}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-green-400/20 rounded">
                  <div>
                     <div className="font-mono text-green-300">{t('currentUser')}{currentUser}</div>
                     <div className="font-mono text-sm text-green-300/60">
                       {t('role')}{isAdmin ? t('administrator') : t('regularUser')}
                     </div>
                  </div>
                  <div className={`px-3 py-1 rounded font-mono text-sm ${
                    isAdmin ? 'bg-red-400/20 text-red-300' : 'bg-blue-400/20 text-blue-300'
                  }`}>
                    {isAdmin ? t('adminLabel') : t('userLabel')}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleLogin('guest', 'password')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded font-mono hover:bg-gray-500 transition-colors"
                  >
                     {t('loginAsGuest')}
                  </button>
                  <button
                    onClick={() => handleLogin('john', 'password')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded font-mono hover:bg-blue-500 transition-colors"
                  >
                     {t('loginAsJohn')}
                  </button>
                  <button
                    onClick={() => handleLogin('admin', 'secret')}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded font-mono hover:bg-red-500 transition-colors"
                  >
                     {t('loginAsAdmin')}
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Panel Access */}
            <div className="terminal p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                 <h3 className="text-lg font-mono text-green-400">{t('adminPanel')}</h3>
              </div>
              
              {isAdmin ? (
                <div className="space-y-3">
                   <div className="text-green-400 font-mono">{t('accessGranted')}</div>
                  <div className="bg-green-400/10 border border-green-400/20 p-4 rounded">
                     <h4 className="font-mono text-green-300 mb-2">{t('adminFunctions')}</h4>
                    <ul className="space-y-1 text-green-300/80 text-sm">
                       <li>• {t('userManagement')}</li>
                       <li>• {t('systemConfig')}</li>
                       <li>• {t('securitySettings')}</li>
                       <li>• {t('databaseAccess')}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                 <div className="text-red-400 font-mono">{t('accessDenied')}</div>
              )}
            </div>
          </div>

          {/* JWT Token Editor */}
          <div className="terminal p-6 rounded-lg">
             <h2 className="text-xl font-mono text-green-400 mb-4">{t('tokenInspector')}</h2>
            
            <div className="space-y-4">
              {/* Current Token */}
              <div>
                 <label className="block text-green-300 font-mono mb-2">
                   {t('currentToken')}
                 </label>
                <div className="relative">
                  <textarea
                    value={jwtToken}
                    readOnly
                    className="w-full bg-gray-800 border border-green-400/20 rounded p-3 text-green-300 font-mono text-xs"
                    rows={3}
                  />
                  <button
                    onClick={() => copyToClipboard(jwtToken)}
                    className="absolute top-2 right-2 p-1 text-green-400 hover:text-green-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Token Editor */}
              <div>
                 <label className="block text-green-300 font-mono mb-2">
                   {t('editToken')}
                 </label>
                <textarea
                  value={editedToken}
                  onChange={(e) => handleTokenEdit(e.target.value)}
                  className="w-full bg-gray-800 border border-yellow-400/20 rounded p-3 text-yellow-300 font-mono text-xs"
                  rows={4}
                   placeholder={t('tokenPlaceholder')}
                />
              </div>

              {/* Decoded Token Display */}
              {decodedToken && (
                <div>
                   <label className="block text-green-300 font-mono mb-2">
                     {t('decodedToken')}
                   </label>
                  <div className="bg-gray-800 border border-green-400/20 rounded p-3">
                    <div className="space-y-2 font-mono text-xs">
                      <div>
                         <span className="text-blue-300">{t('header')}</span>
                        <pre className="text-gray-300 ml-2">{JSON.stringify(decodedToken.header, null, 2)}</pre>
                      </div>
                      <div>
                         <span className="text-yellow-300">{t('payload')}</span>
                        <pre className="text-gray-300 ml-2">{JSON.stringify(decodedToken.payload, null, 2)}</pre>
                      </div>
                      <div>
                         <span className="text-red-300">{t('signature')}</span>
                        <div className="text-gray-300 ml-2 break-all">{decodedToken.signature}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exploit Hints */}
        <div className="terminal p-6 rounded-lg mt-6">
           <h3 className="text-lg font-mono text-green-400 mb-4">{t('analysisTools')}</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="vulnerable-code">
               <h4 className="font-mono text-red-400 mb-2">{t('vulnerability')}</h4>
              <code className="text-red-300 font-mono text-sm">
                {t('vulnerabilityDetails')}
              </code>
               <p className="text-red-300/70 text-xs mt-1">
                 {t('vulnerabilityDesc')}
               </p>
            </div>

            <div className="bg-green-400/5 border-l-4 border-green-400 p-3">
               <h4 className="font-mono text-green-400 mb-2">{t('attackStrategies')}</h4>
              <div className="space-y-1 font-mono text-xs">
                 <div className="text-gray-300">{t('strategy1')}</div>
                 <div className="text-gray-300">{t('strategy2')}</div>
                 <div className="text-gray-300">{t('strategy3')}</div>
                 <div className="text-gray-300">{t('strategy4')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {challengeCompleted && (
          <div className="terminal p-6 rounded-lg mt-6 border-green-400">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
               <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
                 {t('challengeCompleted')}
               </h2>
               <p className="text-green-300 mb-4">
                 {t('successMessage')}
               </p>
              <div className="space-y-2 text-sm text-green-300/80">
                 <p><strong>{t('whatYouLearned')}</strong></p>
                 <p><strong>{t('prevention')}</strong></p>
                 <p><strong>{t('realWorldImpact')}</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}