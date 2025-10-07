import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time duration
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// Format score with commas
export function formatScore(score: number): string {
  return score.toLocaleString();
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Sanitize HTML for display (ironically, for a security game!)
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Check if string contains potential XSS
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /document\.cookie/gi,
    /localStorage/gi,
    /sessionStorage/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

// Simulate JWT token creation (for educational purposes)
export function createMockJWT(payload: Record<string, any>, secret: string = 'weak-secret'): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // In a real scenario, this would use proper HMAC-SHA256
  // For our CTF, we'll use a weak signature that can be easily cracked
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Decode JWT (for educational purposes)
export function decodeMockJWT(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    const header = JSON.parse(atob(encodedHeader));
    const payload = JSON.parse(atob(encodedPayload));

    return { header, payload, signature };
  } catch {
    return null;
  }
}

// Validate URL for open redirect challenges
export function isValidRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const parsed = new URL(url);
    
    // For our CTF, we'll be permissive to allow exploitation
    if (allowedDomains.length === 0) {
      return true; // Vulnerable by design
    }
    
    return allowedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

// Simulate SQL injection detection (for potential future challenges)
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /('|(\\')|(;)|(\\;)|(\\x27)|(\\x3D))/gi,
    /(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/gi,
    /(or\s+1\s*=\s*1|and\s+1\s*=\s*1)/gi,
    /(\s*(or|and)\s+\w+\s*(=|like)\s*\w+)/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// Generate achievement badge
export function getAchievementBadge(completedChallenges: number, totalChallenges: number): string {
  const percentage = (completedChallenges / totalChallenges) * 100;
  
  if (percentage === 100) return '🏆 Master Hacker';
  if (percentage >= 80) return '🥇 Elite Hacker';
  if (percentage >= 60) return '🥈 Advanced Hacker';
  if (percentage >= 40) return '🥉 Intermediate Hacker';
  if (percentage >= 20) return '🎯 Novice Hacker';
  return '🔰 Security Trainee';
}