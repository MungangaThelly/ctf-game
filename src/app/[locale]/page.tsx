'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Shield, Terminal, Zap, Trophy, Lock, Code } from 'lucide-react';
import { gameStore } from '@/store/gameStore';
import { GAME_CONFIG } from '@/lib/config';
import { formatScore, getAchievementBadge } from '@/lib/utils';

export default function Home() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const [gameState, setGameState] = useState(gameStore.getGameState());
  const [isLoading, setIsLoading] = useState(true);
  const progress = gameStore.getProgress();

  useEffect(() => {
    setIsLoading(false);
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      setGameState(gameStore.getGameState());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const startGame = () => {
    // Initialize or continue game
    router.push(`/${locale}/challenges`);
  };

  const resetGame = () => {
    if (confirm(t('resetConfirm'))) {
      gameStore.resetGame();
      setGameState(gameStore.getGameState());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="hacker-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Matrix Background Effect */}
      <div className="matrix-bg"></div>
      
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-mono font-bold neon-glow">
                {t('title')}
              </h1>
              <p className="text-green-300/80 text-sm">{t('subtitle')}</p>
            </div>
          </div>
          
          {progress.completed > 0 && (
            <div className="flex items-center space-x-6 font-mono">
              <div className="text-right">
                <div className="text-green-400">Score: {formatScore(gameState.totalScore)}</div>
                <div className="text-green-300/60 text-sm">
                  {progress.completed}/{progress.total} {t('stats.completed')}
                </div>
              </div>
              <div className="text-2xl">
                {getAchievementBadge(progress.completed, progress.total).split(' ')[0]}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center py-16">
            <div className="terminal p-8 rounded-lg max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className="w-5 h-5" />
                <span className="font-mono text-green-400">root@security-lab:~$</span>
                <span className="terminal-cursor"></span>
              </div>
              
              <div className="text-left font-mono text-green-300 space-y-2 mb-8">
                <div>{t('terminal.welcome')}</div>
                <div>{t('terminal.researcher')}</div>
                <div>{t('terminal.mission')}</div>
                <div className="text-orange-400">
                  {t('terminal.warning')}
                </div>
                <div>{t('terminal.prompt')}</div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={startGame}
                  className="bg-green-400 text-black px-8 py-3 rounded font-mono font-bold hover:bg-green-300 transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>{progress.completed > 0 ? t('continue') : t('startGame')}</span>
                </button>
                
                {progress.completed > 0 && (
                  <button
                    onClick={resetGame}
                    className="border border-red-400 text-red-400 px-6 py-3 rounded font-mono hover:bg-red-400/10 transition-colors"
                  >
                    {t('resetGame')}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          {progress.completed > 0 && (
            <section className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="terminal p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-mono text-lg">{t('stats.progress')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono">
                    <span>{t('stats.completed')}:</span>
                    <span className="text-green-400">{progress.completed}/{progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-green-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-green-300/60">
                    {progress.percentage}% {t('stats.complete')}
                  </div>
                </div>
              </div>

              <div className="terminal p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="w-6 h-6 text-orange-400" />
                  <h3 className="font-mono text-lg">{t('stats.score')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-mono text-green-400 neon-glow">
                    {formatScore(gameState.totalScore)}
                  </div>
                  <div className="text-sm text-green-300/60">
                    {t('stats.totalPoints')}
                  </div>
                </div>
              </div>

              <div className="terminal p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Lock className="w-6 h-6 text-purple-400" />
                  <h3 className="font-mono text-lg">{t('stats.level')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-mono">
                    {getAchievementBadge(progress.completed, progress.total)}
                  </div>
                  <div className="text-sm text-green-300/60">
                    {t('stats.currentStatus')}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Features Grid */}
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Code className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.realVulnerabilities')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.realVulnerabilitiesDesc')}
              </p>
            </div>

            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Shield className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.progressiveLearning')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.progressiveLearningDesc')}
              </p>
            </div>

            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Terminal className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.interactive')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.interactiveDesc')}
              </p>
            </div>

            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.scoreCompete')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.scoreCompeteDesc')}
              </p>
            </div>

            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Zap className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.startupFocused')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.startupFocusedDesc')}
              </p>
            </div>

            <div className="border border-green-400/20 p-6 rounded-lg hover:border-green-400/40 transition-colors">
              <Lock className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="font-mono text-lg mb-2">{t('features.safeLearning')}</h3>
              <p className="text-green-300/70 text-sm">
                {t('features.safeLearningDesc')}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-400/20 p-6 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-green-300/60 font-mono text-sm mb-2">
            {t('footer.tagline')}
          </p>
          <p className="text-green-300/40 font-mono text-xs">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
