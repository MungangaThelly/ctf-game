import { Challenge } from '@/types/game';

export const GAME_CONFIG = {
  title: 'Startup Security Showdown',
  subtitle: 'White-hat hacker training for startup environments',
  version: '1.0.0',
  maxHints: 3,
  pointsMultiplier: {
    noHints: 1.0,
    oneHint: 0.8,
    twoHints: 0.6,
    threeHints: 0.4,
  },
  timeBonus: {
    fast: 50, // under 2 minutes
    medium: 25, // under 5 minutes
    slow: 0, // over 5 minutes
  },
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'dom-xss-feedback',
    title: 'DOM-based XSS in Feedback Form',
    description: 'A startup\'s feedback form is vulnerable to DOM-based XSS. Find a way to execute arbitrary JavaScript code.',
    category: 'xss',
    difficulty: 'easy',
    points: 100,
    hints: [
      'Look at how user input is being processed in the feedback form',
      'Check if the input is being directly inserted into the DOM',
      'Try injecting JavaScript code in the form fields',
    ],
    exploitTarget: 'feedback-form',
    completed: false,
    exploited: false,
  },
  {
    id: 'auth-bypass-admin',
    title: 'Authorization Bypass in Admin Panel',
    description: 'The admin panel has weak authorization checks. Can you access admin features without proper credentials?',
    category: 'auth',
    difficulty: 'medium',
    points: 150,
    hints: [
      'Examine how the application checks for admin privileges',
      'Look for client-side authorization logic',
      'Try manipulating browser storage or cookies',
    ],
    exploitTarget: 'admin-panel',
    completed: false,
    exploited: false,
  },
  {
    id: 'jwt-manipulation',
    title: 'JWT Token Manipulation',
    description: 'The application uses JWT tokens for authentication. Can you forge a token to become an admin?',
    category: 'jwt',
    difficulty: 'hard',
    points: 200,
    hints: [
      'Analyze the structure of the JWT token',
      'Check if the token signature is properly validated',
      'Try changing the algorithm in the JWT header',
    ],
    exploitTarget: 'jwt-auth',
    completed: false,
    exploited: false,
  },
  {
    id: 'open-redirect-login',
    title: 'Open Redirect on Login',
    description: 'The login system has an open redirect vulnerability. Exploit it to redirect users to a malicious site.',
    category: 'redirect',
    difficulty: 'easy',
    points: 100,
    hints: [
      'Look for redirect parameters in the login URL',
      'Check if the redirect URL is properly validated',
      'Try redirecting to an external domain',
    ],
    exploitTarget: 'login-redirect',
    completed: false,
    exploited: false,
  },
  {
    id: 'iframe-sandbox-bypass',
    title: 'iframe Sandbox Bypass',
    description: 'Embedded content is displayed in a sandboxed iframe. Find a way to break out of the sandbox.',
    category: 'sandbox',
    difficulty: 'hard',
    points: 250,
    hints: [
      'Examine the iframe sandbox attributes',
      'Look for ways to communicate with the parent window',
      'Check for postMessage vulnerabilities',
    ],
    exploitTarget: 'embedded-content',
    completed: false,
    exploited: false,
  },
];

export const CATEGORIES = {
  xss: {
    name: 'Cross-Site Scripting',
    color: '#ef4444',
    icon: '🚨',
    description: 'Client-side code injection vulnerabilities',
  },
  auth: {
    name: 'Authorization',
    color: '#f97316',
    icon: '🛡️',
    description: 'Access control and privilege escalation',
  },
  jwt: {
    name: 'JWT Security',
    color: '#8b5cf6',
    icon: '🔑',
    description: 'JSON Web Token manipulation and forgery',
  },
  redirect: {
    name: 'Open Redirect',
    color: '#06b6d4',
    icon: '↗️',
    description: 'URL redirection vulnerabilities',
  },
  sandbox: {
    name: 'Sandbox Escape',
    color: '#84cc16',
    icon: '📦',
    description: 'Breaking out of security containers',
  },
} as const;