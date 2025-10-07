'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showCursor?: boolean;
}

export function Terminal({ children, className, title = "terminal", showCursor = false }: TerminalProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("terminal rounded-lg overflow-hidden", className)}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-green-400/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="font-mono text-green-400 text-sm">{title}</span>
        </div>
        <span className="font-mono text-green-300/60 text-xs">{time}</span>
      </div>
      
      {/* Terminal Content */}
      <div className="p-4">
        {children}
        {showCursor && <span className="terminal-cursor ml-1"></span>}
      </div>
    </div>
  );
}

interface MatrixBackgroundProps {
  density?: number;
  speed?: number;
}

export function MatrixBackground({ density = 0.5, speed = 1 }: MatrixBackgroundProps) {
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const charArray = chars.split("");

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > (1 - density)) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, speed]);

  return (
    <canvas
      id="matrix-canvas"
      className="fixed inset-0 pointer-events-none opacity-10 z-[-1]"
    />
  );
}

interface GlitchTextProps {
  text: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({ text, className, intensity = 'medium' }: GlitchTextProps) {
  const [glitchText, setGlitchText] = useState(text);

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    const intervalTime = intensity === 'low' ? 3000 : intensity === 'medium' ? 1500 : 800;

    const interval = setInterval(() => {
      let newText = text;
      const numGlitches = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numGlitches; i++) {
        const randomIndex = Math.floor(Math.random() * text.length);
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        newText = newText.substring(0, randomIndex) + randomChar + newText.substring(randomIndex + 1);
      }

      setGlitchText(newText);

      setTimeout(() => {
        setGlitchText(text);
      }, 100);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, intensity]);

  return (
    <span className={cn("glitch font-mono", className)}>
      {glitchText}
    </span>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = true, 
  color = 'green' 
}: ProgressBarProps) {
  const colorClasses = {
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    purple: 'bg-purple-400'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className="font-mono text-sm text-green-300">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 rounded-full", colorClasses[color])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="h-full bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 50, className, onComplete }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayText}
      {currentIndex < text.length && <span className="terminal-cursor ml-1"></span>}
    </span>
  );
}

interface HackerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function HackerButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className 
}: HackerButtonProps) {
  const variants = {
    primary: 'bg-green-400 text-black hover:bg-green-300 border-green-400',
    secondary: 'bg-transparent text-green-400 border-green-400 hover:bg-green-400/10',
    danger: 'bg-red-500 text-white hover:bg-red-600 border-red-500',
    warning: 'bg-yellow-500 text-black hover:bg-yellow-400 border-yellow-500'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono font-bold rounded border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-green-400/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:shadow-lg hover:shadow-current/20",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
  vulnerable?: boolean;
  className?: string;
}

export function CodeBlock({ code, language = 'javascript', vulnerable = false, className }: CodeBlockProps) {
  return (
    <div className={cn(
      "rounded-lg overflow-hidden border",
      vulnerable 
        ? "border-red-400 bg-red-900/10" 
        : "border-green-400/20 bg-gray-800",
      className
    )}>
      <div className={cn(
        "px-3 py-1 text-xs font-mono flex items-center justify-between",
        vulnerable ? "bg-red-900/20 text-red-300" : "bg-gray-700 text-green-400"
      )}>
        <span>{language}</span>
        {vulnerable && <span className="text-red-400">⚠️ VULNERABLE</span>}
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className={cn(
          "font-mono text-sm",
          vulnerable ? "text-red-300" : "text-green-300"
        )}>
          {code}
        </code>
      </pre>
    </div>
  );
}