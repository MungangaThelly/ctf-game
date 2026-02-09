'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, DollarSign, TrendingUp, Lock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface Analytics {
  summary: {
    totalUsers: number;
    paidUsers: number;
    freeUsers: number;
    newUsersLast30Days: number;
    conversionRate: number;
    totalRevenue: string;
    mrrRevenue: string;
  };
  usersByWeek: Array<{ week: string; users: number }>;
  recentPaidSignups: Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations('admin');
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        if (res.status === 401) {
          setError(t('noAdminAccess'));
        } else {
          setError(t('failedToFetch'));
        }
        return;
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(t('errorLoading'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Unauthenticated state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-green-400 font-mono">{t('loading')}</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="max-w-md p-8 border border-green-400/30 rounded-lg bg-black/50">
          <h2 className="text-2xl font-mono font-bold text-green-400 mb-4">{t('accessRequired')}</h2>
          <p className="text-green-300/80 font-mono mb-6">{t('pleaseSignIn')}</p>
          <Link
            href={`/${locale}/signin`}
            className="block w-full px-6 py-3 bg-green-500/20 border border-green-400 text-green-400 rounded hover:bg-green-500/30 transition-colors text-center font-mono"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  // Admin access required
  if (session?.user?.email !== 'admin@example.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="max-w-md p-8 border border-red-400/30 rounded-lg bg-black/50">
          <div className="flex items-center space-x-2 text-red-400 mb-4">
            <Lock className="w-6 h-6" />
            <h2 className="text-2xl font-mono font-bold">{t('accessDenied')}</h2>
          </div>
          <p className="text-red-300/80 font-mono mb-6">
            {t('adminsOnly')}
          </p>
          <Link
            href={`/${locale}/challenges`}
            className="block w-full px-6 py-3 bg-green-500/20 border border-green-400 text-green-400 rounded hover:bg-green-500/30 transition-colors text-center font-mono"
          >
            {t('goToChallenges')}
          </Link>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/${locale}/challenges`}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-mono font-bold neon-glow">{t('title')}</h1>
          </div>
          <div className="text-green-400/60 font-mono text-sm">
            {session?.user?.email}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-400/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-green-400 font-mono text-center py-12">
            {t('loadingAnalytics')}
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={t('totalUsers')}
                value={analytics.summary.totalUsers}
                icon={<Users className="w-6 h-6" />}
              />
              <StatCard
                title={t('paidUsers')}
                value={analytics.summary.paidUsers}
                subtext={`${analytics.summary.conversionRate}% ${t('conversion')}`}
                highlight
              />
              <StatCard
                title={t('monthlyRevenue')}
                value={`$${analytics.summary.mrrRevenue}`}
                subtext={t('mrr')}
                icon={<DollarSign className="w-6 h-6" />}
              />
              <StatCard
                title={t('newUsers30')}
                value={analytics.summary.newUsersLast30Days}
                icon={<TrendingUp className="w-6 h-6" />}
              />
            </div>

            {/* User Growth Chart */}
            <div className="bg-slate-800 border border-green-400/20 rounded-lg p-6">
              <h2 className="text-xl font-mono font-bold text-green-400 mb-6">{t('userGrowth')}</h2>
              <div className="flex items-end space-x-2 h-48">
                {analytics.usersByWeek.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-green-500/20 border border-green-400/30 rounded-t flex items-end justify-center relative"
                      style={{ height: `${Math.max((item.users / Math.max(...analytics.usersByWeek.map(w => w.users)) * 100) || 20, 20)}px` }}>
                      <span className="text-xs text-green-300 font-mono absolute -top-6">{item.users}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono mt-2">{item.week}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Paid Signups */}
            <div className="bg-slate-800 border border-green-400/20 rounded-lg p-6">
              <h2 className="text-xl font-mono font-bold text-green-400 mb-6">{t('recentPaidSignups')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-green-400/20">
                      <th className="text-left py-3 px-4 text-green-400">{t('email')}</th>
                      <th className="text-left py-3 px-4 text-green-400">{t('name')}</th>
                      <th className="text-left py-3 px-4 text-green-400">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentPaidSignups.length > 0 ? (
                      analytics.recentPaidSignups.map((user) => (
                        <tr key={user.id} className="border-b border-green-400/10 hover:bg-green-400/5">
                          <td className="py-3 px-4 text-green-300">{user.email}</td>
                          <td className="py-3 px-4 text-gray-400">{user.name || '-'}</td>
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-400">
                          {t('noPaidSignups')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-green-400/20 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">{t('freeUsers')}</p>
                <p className="text-3xl font-mono font-bold text-green-300">
                  {analytics.summary.freeUsers}
                </p>
              </div>
              <div className="bg-slate-800 border border-green-400/20 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">{t('totalRevenue')}</p>
                <p className="text-3xl font-mono font-bold text-green-300">
                  ${analytics.summary.totalRevenue}
                </p>
              </div>
              <div className="bg-slate-800 border border-green-400/20 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">{t('conversionRate')}</p>
                <p className="text-3xl font-mono font-bold text-green-300">
                  {analytics.summary.conversionRate}%
                </p>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtext,
  icon,
  highlight = false
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg p-6 ${
        highlight
          ? 'bg-green-500/10 border-green-400/30'
          : 'bg-slate-800 border-green-400/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-gray-400 text-sm">{title}</p>
        {icon && <div className="text-green-400 opacity-60">{icon}</div>}
      </div>
      <p className="text-3xl font-mono font-bold text-green-300">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}
