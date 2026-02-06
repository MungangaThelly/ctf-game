export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'xss' | 'auth' | 'jwt' | 'redirect' | 'sandbox';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints: string[];
  exploitTarget: string;
  isPremium?: boolean;
  completed: boolean;
  exploited: boolean;
  timeStarted?: number;
  timeCompleted?: number;
}

export interface GameState {
  currentLevel: number;
  totalScore: number;
  completedChallenges: string[];
  exploitedChallenges: string[];
  hints: Record<string, number>; // challenge id -> hints used
  startTime: number;
  lastSaveTime: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  totalScore: number;
  completedChallenges: number;
  rank?: number;
  badge?: string;
}

export interface ExploitAttempt {
  challengeId: string;
  attempt: string;
  timestamp: number;
  success: boolean;
  method: 'xss' | 'sql' | 'auth' | 'jwt' | 'redirect' | 'sandbox' | 'other';
}

export interface LeaderboardEntry {
  user: User;
  score: number;
  completedAt: number;
  challengesCompleted: number;
}

export type ThemeMode = 'light' | 'dark' | 'hacker';

export interface GameSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  hintsEnabled: boolean;
  autoSave: boolean;
}