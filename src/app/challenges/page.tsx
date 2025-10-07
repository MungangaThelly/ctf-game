'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
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
              href="/"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-mono font-bold neon-glow">Security Challenges</h1>
          </div>
          
          <div className="flex items-center space-x-6 font-mono">
            <div className="text-right">
              <div className="text-green-400">Score: {formatScore(gameState.totalScore)}</div>
              <div className="text-green-300/60 text-sm">
                {progress.completed}/{progress.total} completed
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Challenge List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-mono mb-4 text-green-400">Available Challenges</h2>
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const category = CATEGORIES[challenge.category];
                const isCompleted = challenge.completed;
                const isExploited = challenge.exploited;
                
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
                        {challenge.difficulty.toUpperCase()}
                      </span>
                      <span className="text-green-400 font-mono">
                        {challenge.points} pts
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
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded font-mono ${
                      selectedChallengeData.difficulty === 'easy' ? 'bg-green-400/20 text-green-300' :
                      selectedChallengeData.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
                      'bg-red-400/20 text-red-300'
                    }`}>
                      {selectedChallengeData.difficulty.toUpperCase()}
                    </span>
                    <span className="text-green-400 font-mono">
                      {selectedChallengeData.points} points
                    </span>
                    <span className="text-green-300/60">
                      Category: {CATEGORIES[selectedChallengeData.category].name}
                    </span>
                  </div>
                </div>

                {/* Hints Section */}
                <div className="terminal p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-mono text-green-400 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>Hints</span>
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
                      {selectedChallengeData.hints.map((hint, index) => (
                        <div 
                          key={index}
                          className="border-l-4 border-yellow-400 bg-yellow-400/5 p-3"
                        >
                          <span className="font-mono text-yellow-300 text-sm">
                            Hint {index + 1}: {hint}
                          </span>
                        </div>
                      ))}
                      <div className="text-orange-400 text-sm font-mono mt-2">
                        ⚠️ Using hints will reduce your final score for this challenge
                      </div>
                    </div>
                  )}
                </div>

                {/* Challenge Environment */}
                <div className="terminal p-6 rounded-lg">
                  <h3 className="text-lg font-mono text-green-400 mb-4">Challenge Environment</h3>
                  
                  {/* This will render the actual vulnerable component */}
                  <div className="bg-gray-800 p-4 rounded border">
                    <div className="text-center text-green-300/60">
                      <p className="font-mono">Loading challenge environment...</p>
                      <p className="text-sm mt-2">
                        Challenge: {selectedChallengeData.exploitTarget}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <Link
                      href={`/challenges/${selectedChallengeData.id}`}
                      className="bg-green-400 text-black px-6 py-2 rounded font-mono font-bold hover:bg-green-300 transition-colors"
                    >
                      Launch Challenge
                    </Link>
                    
                    <button className="border border-blue-400 text-blue-400 px-6 py-2 rounded font-mono hover:bg-blue-400/10 transition-colors">
                      View Source Code
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="terminal p-12 rounded-lg text-center">
                <h2 className="text-xl font-mono text-green-400 mb-4">Select a Challenge</h2>
                <p className="text-green-300/60">
                  Choose a security challenge from the list to begin your ethical hacking journey.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}