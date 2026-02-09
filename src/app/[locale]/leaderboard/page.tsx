'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Crown, Zap, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { gameStore } from '@/store/gameStore';
import { formatScore, formatTime, getAchievementBadge } from '@/lib/utils';
import { Terminal, ProgressBar, MatrixBackground } from '@/components/ui/hacker-ui';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  completedChallenges: number;
  totalChallenges: number;
  timeToComplete: number;
  badge: string;
  rank: number;
}

// Mock leaderboard data (in real app, this would come from a database)
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'CyberNinja',
    score: 2850,
    completedChallenges: 5,
    totalChallenges: 5,
    timeToComplete: 1200000, // 20 minutes
    badge: '🏆 Master Hacker',
    rank: 1
  },
  {
    id: '2',
    username: 'SecurityPro',
    score: 2640,
    completedChallenges: 5,
    totalChallenges: 5,
    timeToComplete: 1800000, // 30 minutes
    badge: '🥇 Elite Hacker',
    rank: 2
  },
  {
    id: '3',
    username: 'WhiteHatDev',
    score: 2100,
    completedChallenges: 4,
    totalChallenges: 5,
    timeToComplete: 2400000, // 40 minutes
    badge: '🥈 Advanced Hacker',
    rank: 3
  },
  {
    id: '4',
    username: 'PenTestRookie',
    score: 1850,
    completedChallenges: 4,
    totalChallenges: 5,
    timeToComplete: 3000000, // 50 minutes
    badge: '🥉 Intermediate Hacker',
    rank: 4
  },
  {
    id: '5',
    username: 'EthicalHacker',
    score: 1650,
    completedChallenges: 3,
    totalChallenges: 5,
    timeToComplete: 2700000, // 45 minutes
    badge: '🎯 Novice Hacker',
    rank: 5
  }
];

export default function LeaderboardPage() {
  const locale = useLocale();
  const t = useTranslations('leaderboard');
  const [gameState, setGameState] = useState(gameStore.getGameState());
  const [userStats, setUserStats] = useState({
    score: 0,
    completed: 0,
    total: 5,
    rank: 0
  });
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(mockLeaderboardData);

  useEffect(() => {
    const state = gameStore.getGameState();
    const progress = gameStore.getProgress();
    
    setGameState(state);
    setUserStats({
      score: state.totalScore,
      completed: progress.completed,
      total: progress.total,
      rank: calculateUserRank(state.totalScore)
    });
  }, []);

  const calculateUserRank = (score: number): number => {
    const higherScores = mockLeaderboardData.filter(entry => entry.score > score);
    return higherScores.length + 1;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-green-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      case 2:
        return 'text-gray-300 border-gray-400/20 bg-gray-400/5';
      case 3:
        return 'text-amber-600 border-amber-500/20 bg-amber-500/5';
      default:
        return 'text-green-400 border-green-400/20 bg-green-400/5';
    }
  };

  return (
    <div className="min-h-screen">
      <MatrixBackground density={0.3} speed={0.5} />
      
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}`} className="text-green-400 hover:text-green-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-mono font-bold neon-glow text-green-400">
                {t('title')}
              </h1>
              <p className="text-green-300/80 text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Current User Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Terminal title={t('yourStats')} className="p-0">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getRankIcon(userStats.rank)}</div>
                  <div className="text-2xl font-mono text-green-400 neon-glow">
                    #{userStats.rank}
                  </div>
                  <div className="text-green-300/60 text-sm">{t('currentRank')}</div>
                </div>

                <div className="border-t border-green-400/20 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-300">{t('score')}</span>
                    <span className="font-mono text-green-400">{formatScore(userStats.score)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-green-300">{t('completed')}</span>
                    <span className="font-mono text-green-400">{userStats.completed}/{userStats.total}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-300">{t('progress')}</span>
                      <span className="font-mono text-green-400">
                        {Math.round((userStats.completed / userStats.total) * 100)}%
                      </span>
                    </div>
                    <ProgressBar progress={(userStats.completed / userStats.total) * 100} />
                  </div>

                  <div className="pt-3 border-t border-green-400/20">
                    <div className="text-center">
                      <div className="text-lg">
                        {getAchievementBadge(userStats.completed, userStats.total)}
                      </div>
                      <div className="text-green-300/60 text-sm mt-1">{t('achievementBadge')}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-400/20">
                  <Link 
                    href={`/${locale}/challenges`}
                    className="w-full bg-green-400 text-black px-4 py-2 rounded font-mono font-bold hover:bg-green-300 transition-colors text-center block"
                  >
                    {t('continueChallenges')}
                  </Link>
                </div>
              </div>
            </Terminal>

            {/* Global Stats */}
            <Terminal title={t('globalStats')} className="p-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-green-300">{t('totalPlayers')}</span>
                  </div>
                  <span className="font-mono text-green-400">1,247</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-green-300">{t('exploitsFound')}</span>
                  </div>
                  <span className="font-mono text-green-400">3,891</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-green-300">{t('avgCompletion')}</span>
                  </div>
                  <span className="font-mono text-green-400">35m 22s</span>
                </div>
              </div>
            </Terminal>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Terminal title={t('topHackers')} className="p-0">
              <div className="space-y-3">
                {leaderboardData.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className={`p-4 rounded-lg border transition-all hover:border-green-400/40 ${getRankColor(entry.rank)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(entry.rank)}
                          <span className="font-mono text-2xl font-bold">#{entry.rank}</span>
                        </div>
                        
                        <div>
                          <div className="font-mono text-lg font-bold text-green-400">
                            {entry.username}
                          </div>
                          <div className="text-sm text-green-300/60">
                            {entry.badge}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-mono text-xl font-bold text-green-400">
                          {formatScore(entry.score)}
                        </div>
                        <div className="text-sm text-green-300/60">
                          {entry.completedChallenges}/{entry.totalChallenges} {t('challenges')}
                        </div>
                        <div className="text-xs text-green-300/40">
                          {formatTime(entry.timeToComplete)}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for challenges completed */}
                    <div className="mt-3">
                      <ProgressBar 
                        progress={(entry.completedChallenges / entry.totalChallenges) * 100}
                        showPercentage={false}
                        color={entry.rank <= 3 ? 'green' : 'blue'}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Show user position if not in top 5 */}
              {userStats.rank > 5 && (
                <div className="mt-6 pt-4 border-t border-green-400/20">
                  <div className="text-center text-green-300/60 font-mono text-sm mb-3">
                    {t('yourPosition')}
                  </div>
                  <div className="p-4 rounded-lg border border-green-400/20 bg-green-400/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-6 h-6 text-green-400" />
                          <span className="font-mono text-2xl font-bold text-green-400">
                            #{userStats.rank}
                          </span>
                        </div>
                        
                        <div>
                          <div className="font-mono text-lg font-bold text-green-400">
                            {t('you')}
                          </div>
                          <div className="text-sm text-green-300/60">
                            {getAchievementBadge(userStats.completed, userStats.total)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-mono text-xl font-bold text-green-400">
                          {formatScore(userStats.score)}
                        </div>
                        <div className="text-sm text-green-300/60">
                          {userStats.completed}/{userStats.total} {t('challenges')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <ProgressBar 
                        progress={(userStats.completed / userStats.total) * 100}
                        showPercentage={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Terminal>
          </div>
        </div>
      </div>
    </div>
  );
}