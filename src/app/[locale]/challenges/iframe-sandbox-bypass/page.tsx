'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, FileText, Code } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { gameStore } from '@/store/gameStore';
import { useLocale, useTranslations } from 'next-intl';

export default function IframeSandboxChallenge() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('iframeSandbox');
  const [embedContent, setEmbedContent] = useState('<h1>Hello World!</h1><p>This is safe embedded content.</p>');
  const [exploited, setExploited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isPaid === false) {
      return;
    }

    // Check if already completed
    const state = gameStore.getGameState();
    setCompleted(state.completedChallenges.includes('iframe-sandbox-bypass'));
    setExploited(state.exploitedChallenges.includes('iframe-sandbox-bypass'));

    // Listen for postMessage from iframe (with proper origin validation)
    const handleMessage = (event: MessageEvent) => {
      const timestamp = new Date().toLocaleTimeString();
      
      // SECURE: Validate message origin to prevent malicious cross-origin communication
      if (event.origin !== window.location.origin) {
        console.warn(`Blocked message from untrusted origin: ${event.origin}`);
        return; // Reject messages from other origins
      }
      
      if (event.data && typeof event.data === 'object') {
        setMessages(prev => [...prev, 
          `${timestamp} - Message received from trusted origin: ${JSON.stringify(event.data)}`
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
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
            onClick={() => signIn(undefined, { callbackUrl: `/${locale}/challenges/iframe-sandbox-bypass` })}
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

  const updateEmbedContent = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background: #f0f0f0;
                margin: 0;
              }
              .content {
                background: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <div class="content">
              ${embedContent}
            </div>
            <script>
              // This script runs inside the sandboxed iframe
              console.log('Iframe script loaded');
              
              // Try to send message to parent (this is the vulnerability!)
              try {
                window.parent.postMessage({
                  type: 'SANDBOX_ESCAPE_ATTEMPT',
                  source: 'embedded_iframe',
                  message: 'I escaped the sandbox!',
                  timestamp: Date.now(),
                  userAgent: navigator.userAgent,
                  cookies: document.cookie,
                  origin: window.location.origin
                }, '*');
              } catch (e) {
                console.log('PostMessage blocked by sandbox');
              }
            </script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  };

  const completeChallenge = () => {
    const points = gameStore.completeChallenge('iframe-sandbox-bypass', hintsUsed);
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

  const exampleExploits = [
    {
      name: t('exampleExploit1Title'),
      code: `<script>
window.parent.postMessage({
  type: 'SANDBOX_ESCAPE_ATTEMPT',
  message: 'Escaped sandbox!',
  data: document.cookie
}, '*');
</script>`
    },
    {
      name: t('exampleExploit2Title'),
      code: `<script>
window.parent.postMessage({
  type: 'SANDBOX_ESCAPE_ATTEMPT',
  cookies: document.cookie,
  localStorage: JSON.stringify(localStorage)
}, '*');
</script>`
    },
    {
      name: t('exampleExploit3Title'),
      code: `<script>
try {
  window.parent.document.title = 'HACKED!';
  window.parent.postMessage({
    type: 'SANDBOX_ESCAPE_ATTEMPT',
    message: 'DOM manipulation successful!'
  }, '*');
} catch(e) {
  window.parent.postMessage({
    type: 'SANDBOX_ESCAPE_ATTEMPT', 
    message: 'PostMessage still works!'
  }, '*');
}
</script>`
    }
  ];

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

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Challenge Environment */}
          <div className="lg:col-span-2 space-y-6">
            <div className="terminal p-6 rounded-lg">
              <h2 className="text-xl font-mono text-green-400 mb-4">{t('cmsTitle')}</h2>
              
              {/* Content Input */}
              <div className="mb-6">
                <label className="block text-green-300 text-sm font-bold mb-2">
                  {t('embeddedContentLabel')}
                </label>
                <textarea
                  value={embedContent}
                  onChange={(e) => setEmbedContent(e.target.value)}
                  className="w-full h-32 p-3 bg-gray-800 text-green-300 rounded border border-green-400/20 focus:border-green-400 focus:outline-none font-mono text-sm"
                  placeholder={t('embeddedContentPlaceholder')}
                />
                <button
                  onClick={updateEmbedContent}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm"
                >
                  {t('updatePreview')}
                </button>
              </div>

              {/* Vulnerable Iframe */}
              <div className="border border-green-400/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-green-400">{t('sandboxedPreview')}</h3>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-mono text-orange-400 text-sm">sandbox="allow-scripts"</span>
                  </div>
                </div>
                
                {/* SECURE: Properly sandboxed iframe */}
                <iframe
                  ref={iframeRef}
                  className="w-full h-64 border border-gray-600 rounded bg-white"
                  sandbox="" // ✅ No permissions - safest option
                  title="Embedded Content Preview"
                />
                
                <div className="mt-2 text-xs text-orange-300 font-mono">
                  {t('sandboxWarning')}
                </div>
              </div>
            </div>

            {/* Example Exploits */}
            <div className="terminal p-6 rounded-lg">
              <h3 className="text-lg font-mono text-green-400 mb-4">{t('exampleExploits')}</h3>
              <div className="space-y-3">
                {exampleExploits.map((exploit, index) => (
                  <div key={index} className="border border-gray-600 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-yellow-400 text-sm">{exploit.name}</span>
                      <button
                        onClick={() => setEmbedContent(exploit.code)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-green-300 rounded text-xs font-mono"
                      >
                        {t('useThis')}
                      </button>
                    </div>
                    <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                      {exploit.code}
                    </pre>
                  </div>
                ))}
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

          {/* Security Analysis */}
          <div className="space-y-6">
            <div className="terminal p-6 rounded-lg">
              <h3 className="text-lg font-mono text-green-400 mb-4">{t('securityAnalysis')}</h3>
              
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-400 p-4 rounded">
                  <h4 className="font-mono text-red-400 mb-2">{t('vulnerabilityTitle')}</h4>
                  <p className="text-red-300 text-sm">{t('vulnerabilityDescription')}</p>
                </div>

                <div className="bg-orange-900/20 border border-orange-400 p-4 rounded">
                  <h4 className="font-mono text-orange-400 mb-2">{t('impactTitle')}</h4>
                  <div className="text-orange-300 text-sm space-y-1">
                    <p>{t('impactItem1')}</p>
                    <p>{t('impactItem2')}</p>
                    <p>{t('impactItem3')}</p>
                    <p>{t('impactItem4')}</p>
                  </div>
                </div>

                {/* Vulnerable vs Safe Code */}
                <div className="vulnerable-code">
                  <div className="text-red-400 text-xs font-bold mb-2">{t('vulnerableLabel')}</div>
                  <pre className="text-green-300 text-xs">
{`<iframe sandbox="allow-scripts">
  // ❌ Can execute scripts AND communicate
</iframe>`}
                  </pre>
                </div>

                <div className="bg-green-900/20 border border-green-400 p-3 rounded">
                  <div className="text-green-400 text-xs font-bold mb-2">{t('safeLabel')}</div>
                  <pre className="text-green-300 text-xs">
{`<iframe sandbox="">
  // ✅ No scripts, no communication
</iframe>

// Or with restricted permissions:
<iframe sandbox="allow-scripts allow-same-origin"
        src="trusted-domain-only.com">
</iframe>`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Message Log */}
            {messages.length > 0 && (
              <div className="terminal p-6 rounded-lg">
                <h3 className="text-lg font-mono text-green-400 mb-4">{t('messageLog')}</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`font-mono text-xs p-2 rounded ${
                        message.includes('SANDBOX_ESCAPE') 
                          ? 'bg-red-900/20 text-red-300 border border-red-400'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {message}
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