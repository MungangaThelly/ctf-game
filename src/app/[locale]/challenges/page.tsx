'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Lightbulb, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { gameStore } from '@/store/gameStore';
import { CHALLENGES, CATEGORIES } from '@/lib/config';
import { formatScore } from '@/lib/utils';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(gameStore.getChallengesWithState());
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [gameState, setGameState] = useState(gameStore.getGameState());
  const progress = gameStore.getProgress();

  useEffect(() => {
    setChallenges(gameStore.getChallengesWithState());
    setGameState(gameStore.getGameState());
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const handleLaunch = (challengeId: string, isPremium?: boolean) => {
    if (status !== 'authenticated') {
      // Redirect to sign-in (NextAuth) or prompt
      signIn(undefined, { callbackUrl: `/${locale}/challenges/${challengeId}` });
      return;
    }

    if (isPremium && !session?.user?.isPaid) {
      router.push(`/${locale}/pricing`);
      return;
    }

    router.push(`/${locale}/challenges/${challengeId}`);
  };

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setShowHints(false);
  };

  const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/${locale}`}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-mono font-bold neon-glow">{t('title')}</h1>
          </div>
          
          <div className="flex items-center space-x-6 font-mono">
            <div className="text-right">
              <div className="text-green-400">{t('score')}: {formatScore(gameState.totalScore)}</div>
              <div className="text-green-300/60 text-sm">
                {progress.completed}/{progress.total} {t('completed')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Challenge List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-mono mb-4 text-green-400">{t('availableChallenges')}</h2>
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const category = CATEGORIES[challenge.category];
                const isCompleted = challenge.completed;
                const isExploited = challenge.exploited;
                const isLocked = challenge.isPremium && !session?.user?.isPaid;
                
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleChallengeSelect(challenge.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedChallenge === challenge.id
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-green-400/20 hover:border-green-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-mono text-sm" style={{color: category.color}}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {isLocked && (
                          <div title="Premium">
                            <Lock className="w-4 h-4 text-yellow-400" />
                          </div>
                        )}
                        {isExploited && (
                          <div title="Exploited">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                          </div>
                        )}
                        {isCompleted && (
                          <div title="Completed">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-mono font-semibold text-green-300 mb-1">
                      {challenge.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded font-mono ${
                        challenge.difficulty === 'easy' ? 'bg-green-400/20 text-green-300' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
                        'bg-red-400/20 text-red-300'
                      }`}>
                        {t(challenge.difficulty.toUpperCase().toLowerCase())}
                      </span>
                      {challenge.isPremium && (
                        <span className="px-2 py-1 rounded font-mono bg-yellow-400/20 text-yellow-300">
                          {t('premium')}
                        </span>
                      )}
                      <span className="text-green-400 font-mono">
                        {challenge.points} {t('points').toLowerCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Challenge Details */}
          <div className="lg:col-span-2">
            {selectedChallengeData ? (
              <div className="space-y-6">
                
                {/* Challenge Header */}
                <div className="terminal p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-mono font-bold text-green-400">
                      {selectedChallengeData.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {selectedChallengeData.exploited && (
                        <span className="px-3 py-1 bg-orange-400/20 text-orange-300 rounded font-mono text-sm">
                          EXPLOITED
                        </span>
                      )}
                      {selectedChallengeData.completed && (
                        <span className="px-3 py-1 bg-green-400/20 text-green-300 rounded font-mono text-sm">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-green-300 mb-4">{selectedChallengeData.description}</p>

                  {selectedChallengeData.isPremium && !session?.user?.isPaid && (
                    <div className="mt-4 p-4 border border-yellow-400/40 bg-yellow-400/10 rounded">
                      <div className="flex items-center space-x-2 text-yellow-300 font-mono">
                        <Lock className="w-4 h-4" />
                        <span>{t('premiumChallenge')}</span>
                      </div>
                      <div className="mt-3">
                        <Link href={`/${locale}/pricing`} className="inline-block px-4 py-2 bg-yellow-500 text-black rounded font-mono text-sm">
                          {t('upgradeNow')}
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded font-mono ${
                      selectedChallengeData.difficulty === 'easy' ? 'bg-green-400/20 text-green-300' :
                      selectedChallengeData.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
                      'bg-red-400/20 text-red-300'
                    }`}>
                      {t(selectedChallengeData.difficulty.toUpperCase().toLowerCase())}
                    </span>
                    <span className="text-green-400 font-mono">
                      {selectedChallengeData.points} {t('points').toLowerCase()}
                    </span>
                    <span className="text-green-300/60">
                      {t('category')}: {CATEGORIES[selectedChallengeData.category].name}
                    </span>
                  </div>
                </div>

                {/* Hints Section */}
                <div className="terminal p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-mono text-green-400 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>{t('hints')}</span>
                    </h3>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center space-x-2 text-green-300 hover:text-green-400 transition-colors"
                    >
                      {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="font-mono text-sm">
                        {showHints ? t('hideHints') : t('showHints')}
                      </span>
                    </button>
                  </div>
                  
                  {showHints && (
                    <div className="space-y-3">
                      {selectedChallengeData.hints.map((hint, index) => (
                        <div 
                          key={index}
                          className="border-l-4 border-yellow-400 bg-yellow-400/5 p-3"
                        >
                          <span className="font-mono text-yellow-300 text-sm">
                            {t('hint')} {index + 1}: {hint}
                          </span>
                        </div>
                      ))}
                      <div className="text-orange-400 text-sm font-mono mt-2">
                        {t('hintWarning')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Challenge Environment */}
                <div className="terminal p-6 rounded-lg">
                  <h3 className="text-lg font-mono text-green-400 mb-4">{t('challengeEnvironment')}</h3>
                  
                  {/* This will render the actual vulnerable component */}
                  <div className="bg-gray-800 p-4 rounded border">
                    <div className="text-center text-green-300/60">
                      <p className="font-mono">{t('loadingEnvironment')}</p>
                      <p className="text-sm mt-2">
                        {t('challenges')}: {selectedChallengeData.exploitTarget}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleLaunch(selectedChallengeData.id, selectedChallengeData.isPremium)}
                      disabled={selectedChallengeData.isPremium && !session?.user?.isPaid}
                      className={`px-6 py-2 rounded font-mono font-bold transition-colors ${
                        selectedChallengeData.isPremium && !session?.user?.isPaid
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-green-400 text-black hover:bg-green-300'
                      }`}
                    >
                      {selectedChallengeData.isPremium && !session?.user?.isPaid
                        ? t('upgradeToLaunch')
                        : t('launchChallenge')}
                    </button>
                    
                    <button className="border border-blue-400 text-blue-400 px-6 py-2 rounded font-mono hover:bg-blue-400/10 transition-colors">
                      {t('viewSourceCode')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="terminal p-12 rounded-lg text-center">
                <h2 className="text-xl font-mono text-green-400 mb-4">{t('selectChallenge')}</h2>
                <p className="text-green-300/60">
                  {t('selectDescription')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}