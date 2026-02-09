'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Shield, Trophy, Target, BookOpen, Menu, X, Home, User, BarChart3, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navigation');
  const { data: session } = useSession();

  const navigation = [
    { name: t('home'), href: '/', icon: Home },
    { name: t('challenges'), href: '/challenges', icon: Target },
    { name: t('leaderboard'), href: '/leaderboard', icon: Trophy },
    { name: t('learn'), href: '/learn', icon: BookOpen },
    { name: t('pricing'), href: '/pricing', icon: Shield },
  ];

  const getLocaleHref = (href: string) => {
    return `/${locale}${href}`;
  };

  const switchLanguage = (newLocale: string) => {
    if (pathname.startsWith('/en') || pathname.startsWith('/fr')) {
      const parts = pathname.split('/').filter(Boolean);
      parts[0] = newLocale;
      window.location.href = '/' + parts.join('/');
    } else {
      window.location.href = `/${newLocale}${pathname}`;
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === getLocaleHref(item.href) || pathname.endsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={getLocaleHref(item.href)}
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

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-green-300 hover:text-green-400 hover:bg-green-400/10 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{locale.toUpperCase()}</span>
          </button>
          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-1 bg-black/95 border border-green-400/20 rounded-md shadow-lg z-50">
              <button
                onClick={() => { switchLanguage('en'); setShowLanguageMenu(false); }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm font-mono transition-colors",
                  locale === 'en'
                    ? "bg-green-400/20 text-green-400"
                    : "text-green-300 hover:bg-green-400/10 hover:text-green-400"
                )}
              >
                English
              </button>
              <button
                onClick={() => { switchLanguage('fr'); setShowLanguageMenu(false); }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm font-mono transition-colors border-t border-green-400/10",
                  locale === 'fr'
                    ? "bg-green-400/20 text-green-400"
                    : "text-green-300 hover:bg-green-400/10 hover:text-green-400"
                )}
              >
                Français
              </button>
            </div>
          )}
        </div>

        {/* Session actions */}
        {session ? (
          <div className="flex items-center space-x-3">
            <div className="text-sm font-mono text-green-300">{session.user?.username || session.user?.name}</div>
            {session.user?.email === 'admin@example.com' && (
              <Link href={getLocaleHref('/admin')} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-mono text-sm flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{t('admin')}</span>
              </Link>
            )}
            <Link href={getLocaleHref('/profile')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{t('profile')}</span>
            </Link>
            <button onClick={() => signOut()} className="px-3 py-2 bg-red-600 text-white rounded font-mono text-sm">{t('signOut')}</button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href={getLocaleHref('/signup')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm">{t('signUp')}</Link>
            <button onClick={() => signIn(undefined, { callbackUrl: getLocaleHref('/challenges') })} className="px-3 py-2 bg-green-400 text-black rounded font-mono text-sm">{t('signIn')}</button>
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
          <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-green-400/20 p-4 z-50">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === getLocaleHref(item.href) || pathname.endsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={getLocaleHref(item.href)}
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

              {/* Language Switcher Mobile */}
              <div className="pt-3 border-t border-green-400/10">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-green-300 hover:text-green-400 hover:bg-green-400/10 rounded-md transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>{t('language')}</span>
                </button>
                {showLanguageMenu && (
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => { switchLanguage('en'); setShowLanguageMenu(false); setIsOpen(false); }}
                      className={cn(
                        "block w-full px-4 py-2 text-left text-sm font-mono rounded transition-colors",
                        locale === 'en'
                          ? "bg-green-400/20 text-green-400"
                          : "text-green-300 hover:bg-green-400/10 hover:text-green-400"
                      )}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { switchLanguage('fr'); setShowLanguageMenu(false); setIsOpen(false); }}
                      className={cn(
                        "block w-full px-4 py-2 text-left text-sm font-mono rounded transition-colors",
                        locale === 'fr'
                          ? "bg-green-400/20 text-green-400"
                          : "text-green-300 hover:bg-green-400/10 hover:text-green-400"
                      )}
                    >
                      Français
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-green-400/10 space-y-2">
                {session ? (
                  <>
                    <div className="font-mono text-sm text-green-300 px-3 py-2">{session.user?.username || session.user?.name}</div>
                    {session.user?.email === 'admin@example.com' && (
                      <Link href={getLocaleHref('/admin')} onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-mono text-sm text-center flex items-center justify-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>{t('admin')}</span>
                      </Link>
                    )}
                    <Link href={getLocaleHref('/profile')} onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm text-center">
                      {t('profile')}
                    </Link>
                    <button onClick={() => signOut()} className="w-full px-3 py-2 bg-red-600 text-white rounded font-mono text-sm">{t('signOut')}</button>
                  </>
                ) : (
                  <>
                    <Link href={getLocaleHref('/signup')} onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm text-center">
                      {t('signUp')}
                    </Link>
                    <button onClick={() => signIn(undefined, { callbackUrl: getLocaleHref('/challenges') })} className="w-full px-3 py-2 bg-green-400 text-black rounded font-mono text-sm">{t('signIn')}</button>
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
  const locale = useLocale();
  
  return (
    <header className="sticky top-0 z-50 border-b border-green-400/20 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center space-x-3">
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