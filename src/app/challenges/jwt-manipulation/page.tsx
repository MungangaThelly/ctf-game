'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Key, Shield, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { gameStore } from '@/store/gameStore';
import { createMockJWT, decodeMockJWT } from '@/lib/utils';

export default function JWTManipulationChallenge() {
  const [currentUser, setCurrentUser] = useState('guest');
  const [jwtToken, setJwtToken] = useState('');
  const [editedToken, setEditedToken] = useState('');
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exploitDetected, setExploitDetected] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
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
      // Check if user successfully manipulated the token to become admin
      const isNowAdmin = decoded.payload.admin === true || decoded.payload.role === 'admin';
      
      if (isNowAdmin && currentUser !== 'admin') {
        setExploitDetected(true);
        setIsAdmin(true);
        gameStore.recordExploit('jwt-manipulation', true);
        
        if (!challengeCompleted) {
          const points = gameStore.completeChallenge('jwt-manipulation');
          setChallengeCompleted(true);
          alert(`🎉 JWT Manipulation Successful! You earned ${points} points!`);
        }
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
              href="/challenges"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-mono font-bold neon-glow">
              JWT Token Manipulation
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploitDetected && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono text-sm">Privilege Escalated!</span>
              </div>
            )}
            {challengeCompleted && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-mono text-sm">Completed</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* Challenge Description */}
        <div className="terminal p-6 rounded-lg mb-6">
          <h2 className="text-lg font-mono text-green-400 mb-4">🎯 Mission Briefing</h2>
          <div className="space-y-2 text-green-300 font-mono text-sm">
            <p>You've gained access to a startup's authentication system that uses JWT tokens.</p>
            <p>The system appears to have weak JWT implementation and validation.</p>
            <p>Your goal: Manipulate your JWT token to gain administrative privileges.</p>
            <p className="text-orange-400">⚠️ Look for weak signature validation or algorithm confusion!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Login Simulation */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Key className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-mono text-green-400">Authentication System</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-green-400/20 rounded">
                  <div>
                    <div className="font-mono text-green-300">Current User: {currentUser}</div>
                    <div className="font-mono text-sm text-green-300/60">
                      Role: {isAdmin ? 'Administrator' : 'Regular User'}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded font-mono text-sm ${
                    isAdmin ? 'bg-red-400/20 text-red-300' : 'bg-blue-400/20 text-blue-300'
                  }`}>
                    {isAdmin ? 'ADMIN' : 'USER'}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleLogin('guest', 'password')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded font-mono hover:bg-gray-500 transition-colors"
                  >
                    Login as Guest
                  </button>
                  <button
                    onClick={() => handleLogin('john', 'password')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded font-mono hover:bg-blue-500 transition-colors"
                  >
                    Login as John (User)
                  </button>
                  <button
                    onClick={() => handleLogin('admin', 'secret')}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded font-mono hover:bg-red-500 transition-colors"
                  >
                    Login as Admin (Restricted)
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Panel Access */}
            <div className="terminal p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-mono text-green-400">Admin Panel</h3>
              </div>
              
              {isAdmin ? (
                <div className="space-y-3">
                  <div className="text-green-400 font-mono">✅ Access Granted!</div>
                  <div className="bg-green-400/10 border border-green-400/20 p-4 rounded">
                    <h4 className="font-mono text-green-300 mb-2">Administrative Functions:</h4>
                    <ul className="space-y-1 text-green-300/80 text-sm">
                      <li>• User Management</li>
                      <li>• System Configuration</li>
                      <li>• Security Settings</li>
                      <li>• Database Access</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 font-mono">❌ Access Denied - Admin privileges required</div>
              )}
            </div>
          </div>

          {/* JWT Token Editor */}
          <div className="terminal p-6 rounded-lg">
            <h2 className="text-xl font-mono text-green-400 mb-4">JWT Token Inspector</h2>
            
            <div className="space-y-4">
              {/* Current Token */}
              <div>
                <label className="block text-green-300 font-mono mb-2">
                  Current JWT Token:
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
                  Edit Token (Try to escalate privileges):
                </label>
                <textarea
                  value={editedToken}
                  onChange={(e) => handleTokenEdit(e.target.value)}
                  className="w-full bg-gray-800 border border-yellow-400/20 rounded p-3 text-yellow-300 font-mono text-xs"
                  rows={4}
                  placeholder="Paste and modify JWT token here..."
                />
              </div>

              {/* Decoded Token Display */}
              {decodedToken && (
                <div>
                  <label className="block text-green-300 font-mono mb-2">
                    Decoded Token:
                  </label>
                  <div className="bg-gray-800 border border-green-400/20 rounded p-3">
                    <div className="space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-blue-300">Header:</span>
                        <pre className="text-gray-300 ml-2">{JSON.stringify(decodedToken.header, null, 2)}</pre>
                      </div>
                      <div>
                        <span className="text-yellow-300">Payload:</span>
                        <pre className="text-gray-300 ml-2">{JSON.stringify(decodedToken.payload, null, 2)}</pre>
                      </div>
                      <div>
                        <span className="text-red-300">Signature:</span>
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
          <h3 className="text-lg font-mono text-green-400 mb-4">🔍 Analysis Tools</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="vulnerable-code">
              <h4 className="font-mono text-red-400 mb-2">Vulnerability:</h4>
              <code className="text-red-300 font-mono text-sm">
                No signature validation + Client-side role checks
              </code>
              <p className="text-red-300/70 text-xs mt-1">
                The application trusts JWT payload without proper verification
              </p>
            </div>

            <div className="bg-green-400/5 border-l-4 border-green-400 p-3">
              <h4 className="font-mono text-green-400 mb-2">Attack Strategies:</h4>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-gray-300">1. Modify the "admin" field to true</div>
                <div className="text-gray-300">2. Change "role" to "admin"</div>
                <div className="text-gray-300">3. Alter algorithm to "none"</div>
                <div className="text-gray-300">4. Re-encode the modified payload</div>
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
                JWT Manipulation Successful! 🔓
              </h2>
              <p className="text-green-300 mb-4">
                You successfully escalated your privileges by manipulating the JWT token!
              </p>
              <div className="space-y-2 text-sm text-green-300/80">
                <p><strong>What you learned:</strong> JWT tokens without proper signature validation can be manipulated</p>
                <p><strong>Prevention:</strong> Always validate JWT signatures server-side and never trust client-side tokens</p>
                <p><strong>Real-world impact:</strong> Privilege escalation, unauthorized access to sensitive data and functions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}