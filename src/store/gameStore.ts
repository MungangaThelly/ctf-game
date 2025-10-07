import { GameState, GameSettings, Challenge, ExploitAttempt } from '@/types/game';
import { CHALLENGES, GAME_CONFIG } from '@/lib/config';

class GameStore {
  private readonly STORAGE_KEYS = {
    GAME_STATE: 'ctf_game_state',
    SETTINGS: 'ctf_settings',
    EXPLOITS: 'ctf_exploits',
  };

  // Initialize default game state
  private getDefaultState(): GameState {
    return {
      currentLevel: 0,
      totalScore: 0,
      completedChallenges: [],
      exploitedChallenges: [],
      hints: {},
      startTime: Date.now(),
      lastSaveTime: Date.now(),
    };
  }

  // Initialize default settings
  private getDefaultSettings(): GameSettings {
    return {
      theme: 'hacker',
      soundEnabled: true,
      hintsEnabled: true,
      autoSave: true,
    };
  }

  // Get current game state
  getGameState(): GameState {
    if (typeof window === 'undefined') return this.getDefaultState();
    
    const saved = localStorage.getItem(this.STORAGE_KEYS.GAME_STATE);
    if (saved) {
      try {
        return { ...this.getDefaultState(), ...JSON.parse(saved) };
      } catch {
        return this.getDefaultState();
      }
    }
    return this.getDefaultState();
  }

  // Save game state
  saveGameState(state: Partial<GameState>): void {
    if (typeof window === 'undefined') return;
    
    const currentState = this.getGameState();
    const newState = { ...currentState, ...state, lastSaveTime: Date.now() };
    localStorage.setItem(this.STORAGE_KEYS.GAME_STATE, JSON.stringify(newState));
  }

  // Get settings
  getSettings(): GameSettings {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    
    const saved = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      } catch {
        return this.getDefaultSettings();
      }
    }
    return this.getDefaultSettings();
  }

  // Save settings
  saveSettings(settings: Partial<GameSettings>): void {
    if (typeof window === 'undefined') return;
    
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  }

  // Complete a challenge
  completeChallenge(challengeId: string, hintsUsed: number = 0): number {
    const state = this.getGameState();
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    
    if (!challenge || state.completedChallenges.includes(challengeId)) {
      return 0;
    }

    // Calculate score with hint penalty
    let points = challenge.points;
    const hintPenalty = GAME_CONFIG.pointsMultiplier[
      hintsUsed === 0 ? 'noHints' :
      hintsUsed === 1 ? 'oneHint' :
      hintsUsed === 2 ? 'twoHints' : 'threeHints'
    ];
    points = Math.floor(points * hintPenalty);

    // Add time bonus if completed quickly
    const timeElapsed = Date.now() - state.startTime;
    const minutesElapsed = timeElapsed / (1000 * 60);
    
    if (minutesElapsed < 2) {
      points += GAME_CONFIG.timeBonus.fast;
    } else if (minutesElapsed < 5) {
      points += GAME_CONFIG.timeBonus.medium;
    }

    this.saveGameState({
      completedChallenges: [...state.completedChallenges, challengeId],
      totalScore: state.totalScore + points,
      hints: { ...state.hints, [challengeId]: hintsUsed },
    });

    return points;
  }

  // Record an exploit attempt
  recordExploit(challengeId: string, exploited: boolean = true): void {
    const state = this.getGameState();
    
    if (exploited && !state.exploitedChallenges.includes(challengeId)) {
      this.saveGameState({
        exploitedChallenges: [...state.exploitedChallenges, challengeId],
      });
    }

    // Save exploit attempt for analysis
    const attempts: ExploitAttempt[] = this.getExploitAttempts();
    const newAttempt: ExploitAttempt = {
      challengeId,
      attempt: 'exploit_executed', // This would contain the actual exploit in a real scenario
      timestamp: Date.now(),
      success: exploited,
      method: CHALLENGES.find(c => c.id === challengeId)?.category || 'other',
    };

    attempts.push(newAttempt);
    localStorage.setItem(this.STORAGE_KEYS.EXPLOITS, JSON.stringify(attempts.slice(-100))); // Keep last 100 attempts
  }

  // Get exploit attempts
  getExploitAttempts(): ExploitAttempt[] {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem(this.STORAGE_KEYS.EXPLOITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }

  // Get challenges with current state
  getChallengesWithState(): Challenge[] {
    const state = this.getGameState();
    
    return CHALLENGES.map(challenge => ({
      ...challenge,
      completed: state.completedChallenges.includes(challenge.id),
      exploited: state.exploitedChallenges.includes(challenge.id),
    }));
  }

  // Reset game
  resetGame(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEYS.GAME_STATE);
    localStorage.removeItem(this.STORAGE_KEYS.EXPLOITS);
  }

  // Get current progress
  getProgress(): { completed: number; total: number; percentage: number } {
    const state = this.getGameState();
    const completed = state.completedChallenges.length;
    const total = CHALLENGES.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }
}

export const gameStore = new GameStore();