'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pricing');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/${locale}/signin`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user?.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-300 text-center mb-12">
          {t('subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="border border-gray-600 rounded-lg p-8 bg-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2">{t('free.title')}</h2>
            <p className="text-gray-400 mb-6">{t('free.price')}</p>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>{t('free.feature1')}</li>
              <li>{t('free.feature2')}</li>
              <li>{t('free.feature3')}</li>
              <li>{t('free.feature4')}</li>
              <li>{t('free.feature5')}</li>
            </ul>
            <button
              disabled
              className="w-full bg-gray-500 text-white py-2 rounded-lg cursor-not-allowed"
            >
              {t('free.button')}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="border-2 border-blue-500 rounded-lg p-8 bg-slate-800 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 px-4 py-1 rounded-full text-sm font-bold text-white">
              {t('premium.badge')}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('premium.title')}</h2>
            <p className="text-gray-400 mb-6">{t('premium.price')}</p>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>{t('premium.feature1')}</li>
              <li>{t('premium.feature2')}</li>
              <li>{t('premium.feature3')}</li>
              <li>{t('premium.feature4')}</li>
              <li>{t('premium.feature5')}</li>
              <li>{t('premium.feature6')}</li>
            </ul>
            <button
              onClick={handleCheckout}
              disabled={loading || session?.user?.isPaid}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                session?.user?.isPaid
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              {loading
                ? t('premium.processing')
                : session?.user?.isPaid
                ? t('premium.active')
                : t('premium.upgrade')}
            </button>
          </div>
        </div>

        {!session && (
          <div className="text-center mt-8">
            <p className="text-gray-300">
              <a
                href={`/${locale}/signin`}
                className="text-blue-400 hover:underline"
              >
                {t('signInLink')}
              </a>{' '}
              {t('signInPrompt')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
