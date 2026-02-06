'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { gameStore } from '@/store/gameStore';
import { isValidRedirectUrl } from '@/lib/utils';

export default function OpenRedirectChallenge() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loginAttempts, setLoginAttempts] = useState<string[]>([]);
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
        Loading challenge...
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-gray-900 rounded text-center">
          <div className="text-green-300 mb-4 font-mono">Sign in to access this premium challenge.</div>
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/challenges/open-redirect-login' })}
            className="px-4 py-2 bg-green-400 text-black rounded font-mono"
          >
            Sign in
          </button>
          <div className="mt-4">
            <Link href="/challenges" className="text-green-300 hover:underline font-mono">
              Back to Challenges
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
          <div className="text-yellow-300 mb-4 font-mono">Premium challenge locked. Upgrade to access.</div>
          <Link href="/pricing" className="px-4 py-2 bg-yellow-500 text-black rounded font-mono">
            Upgrade Now
          </Link>
          <div className="mt-4">
            <Link href="/challenges" className="text-green-300 hover:underline font-mono">
              Back to Challenges
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
          `${timestamp} - LOGIN: User "${username}" - Safe redirect to: ${redirectUrl}`
        ]);
        alert('Login successful! Redirecting to dashboard...');
      } else {
        // Reject external or malicious redirects
        setLoginAttempts(prev => [...prev, 
          `${timestamp} - LOGIN: User "${username}" - REJECTED external redirect: ${redirectUrl}`
        ]);
        alert('❌ Login rejected: Invalid redirect URL. Only redirects to the same domain are allowed.');
      }
    } else {
      alert('Please enter both username and password');
    }
  };

  const completeChallenge = () => {
    const points = gameStore.completeChallenge('open-redirect-login', hintsUsed);
    setCompleted(true);
    alert(`🎉 Challenge Completed! 🎉\n\nYou earned ${points} points!\n\nYou've successfully demonstrated how open redirect vulnerabilities can be exploited to redirect users to malicious external websites.`);
  };

  const useHint = () => {
    const hints = [
      "Look at the redirect parameter in the URL. What happens if you change it?",
      "Try setting the redirect parameter to an external website like 'https://evil.com'",
      "The application doesn't validate that the redirect URL belongs to the same domain"
    ];
    
    if (hintsUsed < hints.length) {
      setHintsUsed(hintsUsed + 1);
      alert(`💡 Hint ${hintsUsed + 1}: ${hints[hintsUsed]}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/challenges" className="text-green-400 hover:text-green-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-mono font-bold neon-glow text-green-400">
                Open Redirect Challenge
              </h1>
              <p className="text-green-300/80 text-sm">Find and exploit the redirect vulnerability</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploited && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono">EXPLOITED</span>
              </div>
            )}
            {completed && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-mono">COMPLETED</span>
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
              <h2 className="text-xl font-mono text-green-400 mb-4">🏢 TechStartup Login Portal</h2>
              
              {/* Vulnerable Login Form */}
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg">
                <h3 className="text-xl text-white mb-4">Welcome Back!</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                      placeholder="Enter your username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Visible redirect parameter (vulnerability!) */}
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Redirect After Login
                      <span className="text-yellow-400 ml-2">⚠️ (Debug Mode)</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                        className="flex-1 p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-400 focus:outline-none font-mono text-sm"
                        placeholder="Where to redirect after login"
                      />
                      <ExternalLink className="w-10 h-10 p-2 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      This field is visible due to debug mode being enabled in production
                    </p>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    Sign In
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
                  Use Hint ({hintsUsed}/3)
                </button>
                
                {exploited && !completed && (
                  <button
                    onClick={completeChallenge}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono text-sm"
                  >
                    Complete Challenge
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <h3 className="text-lg font-mono text-green-400 mb-4">🔍 Security Analysis</h3>
              
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-400 p-4 rounded">
                  <h4 className="font-mono text-red-400 mb-2">Vulnerability: Open Redirect</h4>
                  <p className="text-red-300 text-sm">
                    The application accepts a redirect parameter without proper validation.
                    This allows attackers to redirect users to external malicious websites.
                  </p>
                </div>

                <div className="bg-orange-900/20 border border-orange-400 p-4 rounded">
                  <h4 className="font-mono text-orange-400 mb-2">Attack Scenario</h4>
                  <div className="text-orange-300 text-sm space-y-2">
                    <p>1. Attacker crafts malicious login link with external redirect</p>
                    <p>2. Victim clicks legitimate-looking domain in email</p>
                    <p>3. After login, victim is redirected to attacker's phishing site</p>
                    <p>4. Victim enters sensitive info thinking they're still on the legitimate site</p>
                  </div>
                </div>

                {/* Vulnerable Code Example */}
                <div className="vulnerable-code">
                  <div className="text-red-400 text-xs font-bold mb-2">VULNERABLE CODE:</div>
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
                <h3 className="text-lg font-mono text-green-400 mb-4">📋 Login Activity</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loginAttempts.map((attempt, index) => (
                    <div 
                      key={index}
                      className={`font-mono text-xs p-2 rounded ${
                        attempt.includes('EXTERNAL DOMAIN') 
                          ? 'bg-red-900/20 text-red-300 border border-red-400'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {attempt}
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