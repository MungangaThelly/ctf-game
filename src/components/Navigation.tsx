'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Trophy, Target, BookOpen, Menu, X, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Challenges', href: '/challenges', icon: Target },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Pricing', href: '/pricing', icon: Shield },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md font-mono transition-colors",
                isActive
                  ? "bg-green-400/20 text-green-400 border border-green-400/40"
                  : "text-green-300 hover:text-green-400 hover:bg-green-400/10"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Session actions */}
        {session ? (
          <div className="flex items-center space-x-3">
            <div className="text-sm font-mono text-green-300">{session.user?.username || session.user?.name}</div>
            <Link href="/profile" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <button onClick={() => signOut()} className="px-3 py-2 bg-red-600 text-white rounded font-mono text-sm">Sign out</button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href="/signup" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm">Sign up</Link>
            <button onClick={() => signIn()} className="px-3 py-2 bg-green-400 text-black rounded font-mono text-sm">Sign in</button>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-green-400 p-2"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-green-400/20 p-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md font-mono transition-colors",
                      isActive
                        ? "bg-green-400/20 text-green-400 border border-green-400/40"
                        : "text-green-300 hover:text-green-400 hover:bg-green-400/10"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-green-400/10 space-y-2">
                {session ? (
                  <>
                    <div className="font-mono text-sm text-green-300 px-3 py-2">{session.user?.username || session.user?.name}</div>
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm text-center">
                      Profile
                    </Link>
                    <button onClick={() => signOut()} className="w-full px-3 py-2 bg-red-600 text-white rounded font-mono text-sm">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm text-center">
                      Sign up
                    </Link>
                    <button onClick={() => signIn()} className="w-full px-3 py-2 bg-green-400 text-black rounded font-mono text-sm">Sign in</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-green-400/20 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-xl font-mono font-bold neon-glow text-green-400">
                Security CTF
              </div>
              <div className="text-xs text-green-300/60">
                Startup Security Showdown
              </div>
            </div>
          </Link>

          <Navigation />
        </div>
      </div>
    </header>
  );
}