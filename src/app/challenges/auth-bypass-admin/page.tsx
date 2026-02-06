'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Lock, Unlock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { gameStore } from '@/store/gameStore';

export default function AuthBypassChallenge() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [exploitDetected, setExploitDetected] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    // Check if challenge was already completed
    const state = gameStore.getGameState();
    setChallengeCompleted(state.completedChallenges.includes('auth-bypass-admin'));
    
    // Check localStorage for existing session (vulnerable design)
    const storedUser = localStorage.getItem('currentUser');
    const storedAdmin = localStorage.getItem('isAdmin');
    
    if (storedUser) {
      setIsLoggedIn(true);
      setCurrentUser(storedUser);
      setAdminAccess(storedAdmin === 'true');
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    // Simplified login - any password works for demo
    const isAdmin = username === 'admin';
    
    setIsLoggedIn(true);
    setCurrentUser(username);
    
    // Vulnerable: Storing auth state in localStorage
    localStorage.setItem('currentUser', username);
    localStorage.setItem('isAdmin', isAdmin.toString());
    
    setAdminAccess(isAdmin);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAdminAccess(false);
    setShowAdminPanel(false);
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  };

  const attemptAdminAccess = () => {
    // SECURE: Validate credentials server-side (simulated)
    // Only grant access if the actual logged-in user is 'admin'
    // Ignore localStorage flags; trust only authenticated username
    
    if (currentUser === 'admin') {
      setShowAdminPanel(true);
      setAdminAccess(true);
    } else {
      // Non-admin users cannot access admin panel even if localStorage is modified
      alert('Access Denied: Admin privileges required. Only the admin user can access this panel.');
    }
  };

  const manuallySetAdmin = () => {
    // This simulates what an attacker might do via browser dev tools
    localStorage.setItem('isAdmin', 'true');
    setAdminAccess(true);
    alert('localStorage modified: isAdmin = true');
  };

  const hints = [
    'The application stores authentication state in localStorage',
    'Admin privileges are checked client-side using browser storage',
    'Try using browser developer tools to modify localStorage values',
    'Look for the "isAdmin" key in localStorage and change its value'
  ];

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
              Authorization Bypass - Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {exploitDetected && (
              <div className="flex items-center space-x-2 text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono text-sm">Unauthorized Access!</span>
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
            <p>You've discovered a startup's admin panel with weak authorization controls.</p>
            <p>The application appears to rely on client-side authentication checks.</p>
            <p>Your goal: Gain unauthorized access to the admin panel without proper credentials.</p>
            <p className="text-orange-400">⚠️ Look for client-side storage and validation weaknesses!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Authentication System */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-mono text-green-400">User Authentication</h2>
              </div>
              
              {!isLoggedIn ? (
                <div className="space-y-4">
                  <div className="text-green-300 font-mono mb-4">Available Test Accounts:</div>
                  
                  <button
                    onClick={() => handleLogin('guest', 'password')}
                    className="w-full bg-gray-600 text-white px-4 py-3 rounded font-mono hover:bg-gray-500 transition-colors text-left"
                  >
                    <div className="font-semibold">Guest Account</div>
                    <div className="text-sm text-gray-300">Username: guest | Role: User</div>
                  </button>
                  
                  <button
                    onClick={() => handleLogin('john', 'password')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded font-mono hover:bg-blue-500 transition-colors text-left"
                  >
                    <div className="font-semibold">John Doe</div>
                    <div className="text-sm text-blue-200">Username: john | Role: User</div>
                  </button>
                  
                  <div className="bg-red-600/20 border border-red-400/20 px-4 py-3 rounded">
                    <div className="font-semibold text-red-300 font-mono">Admin Account</div>
                    <div className="text-sm text-red-200">Username: admin | Status: Restricted</div>
                    <div className="text-xs text-red-300 mt-1">🔒 Admin login disabled for security</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-green-400/20 rounded">
                    <div>
                      <div className="font-mono text-green-300">Logged in as: {currentUser}</div>
                      <div className="font-mono text-sm text-green-300/60">
                        Role: {adminAccess ? 'Administrator' : 'Regular User'}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded font-mono text-sm ${
                      adminAccess ? 'bg-red-400/20 text-red-300' : 'bg-blue-400/20 text-blue-300'
                    }`}>
                      {adminAccess ? 'ADMIN' : 'USER'}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded font-mono hover:bg-gray-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hints Section */}
            {isLoggedIn && (
              <div className="terminal p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-mono text-green-400 flex items-center space-x-2">
                    <span>💡 Exploit Hints</span>
                  </h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center space-x-2 text-green-300 hover:text-green-400 transition-colors"
                  >
                    {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="font-mono text-sm">
                      {showHints ? 'Hide' : 'Show'} Hints
                    </span>
                  </button>
                </div>
                
                {showHints && (
                  <div className="space-y-3">
                    {hints.map((hint, index) => (
                      <div 
                        key={index}
                        className="border-l-4 border-yellow-400 bg-yellow-400/5 p-3"
                      >
                        <span className="font-mono text-yellow-300 text-sm">
                          {index + 1}. {hint}
                        </span>
                      </div>
                    ))}
                    
                    {/* Quick Exploit Button for Demo */}
                    <button
                      onClick={manuallySetAdmin}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded font-mono hover:bg-orange-500 transition-colors text-sm"
                    >
                      🔧 Quick Exploit: Set Admin Flag
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Panel Access */}
          <div className="terminal p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-mono text-green-400">Admin Control Panel</h2>
            </div>
            
            {!isLoggedIn ? (
              <div className="text-center py-12 text-green-300/60">
                <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-mono">Please login to access admin panel</p>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={attemptAdminAccess}
                  className={`w-full px-6 py-3 rounded font-mono font-bold transition-colors ${
                    adminAccess 
                      ? 'bg-green-600 text-white hover:bg-green-500' 
                      : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {adminAccess ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    <span>Access Admin Panel</span>
                  </div>
                </button>

                {showAdminPanel && adminAccess && (
                  <div className="bg-green-400/10 border border-green-400/20 p-6 rounded">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <h3 className="font-mono text-green-300 text-lg">Admin Panel Unlocked!</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-800 p-4 rounded">
                        <h4 className="font-mono text-green-400 mb-2">System Statistics:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-300/60">Active Users:</span>
                            <span className="text-green-300 ml-2">1,247</span>
                          </div>
                          <div>
                            <span className="text-green-300/60">Database Size:</span>
                            <span className="text-green-300 ml-2">2.4 GB</span>
                          </div>
                          <div>
                            <span className="text-green-300/60">Server Load:</span>
                            <span className="text-green-300 ml-2">23%</span>
                          </div>
                          <div>
                            <span className="text-green-300/60">Uptime:</span>
                            <span className="text-green-300 ml-2">99.9%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded font-mono hover:bg-blue-500 transition-colors">
                          User Management
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded font-mono hover:bg-purple-500 transition-colors">
                          System Config
                        </button>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded font-mono hover:bg-orange-500 transition-colors">
                          Security Logs
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded font-mono hover:bg-red-500 transition-colors">
                          Database Access
                        </button>
                      </div>
                      
                      <div className="text-center text-green-400 font-mono text-sm mt-4">
                        🔓 Full administrative access granted!
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vulnerability Explanation */}
        <div className="terminal p-6 rounded-lg mt-6">
          <h3 className="text-lg font-mono text-green-400 mb-4">🔍 Vulnerability Analysis</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="vulnerable-code">
              <h4 className="font-mono text-red-400 mb-2">Vulnerable Code Pattern:</h4>
              <code className="text-red-300 font-mono text-sm">
                localStorage.setItem('isAdmin', 'true');<br/>
                if (localStorage.getItem('isAdmin') === 'true') &#123;<br/>
                &nbsp;&nbsp;// Grant admin access<br/>
                &#125;
              </code>
              <p className="text-red-300/70 text-xs mt-1">
                Client-side authorization checks can be bypassed
              </p>
            </div>

            <div className="bg-green-400/5 border-l-4 border-green-400 p-3">
              <h4 className="font-mono text-green-400 mb-2">Attack Methods:</h4>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-gray-300">1. Browser Dev Tools → Application → localStorage</div>
                <div className="text-gray-300">2. Console: localStorage.setItem('isAdmin', 'true')</div>
                <div className="text-gray-300">3. Modify session cookies or tokens</div>
                <div className="text-gray-300">4. Intercept and modify API requests</div>
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
                Authorization Bypass Successful! 🔓
              </h2>
              <p className="text-green-300 mb-4">
                You successfully bypassed the client-side authorization checks!
              </p>
              <div className="space-y-2 text-sm text-green-300/80">
                <p><strong>What you learned:</strong> Client-side security controls can be easily manipulated</p>
                <p><strong>Prevention:</strong> Always perform authorization checks on the server-side</p>
                <p><strong>Real-world impact:</strong> Privilege escalation, unauthorized access to sensitive functions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}