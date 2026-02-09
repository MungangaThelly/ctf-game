'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      router.push('/signin');
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
          Premium Access
        </h1>
        <p className="text-gray-300 text-center mb-12">
          Unlock advanced CTF challenges and exclusive content
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="border border-gray-600 rounded-lg p-8 bg-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
            <p className="text-gray-400 mb-6">Always free</p>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>✓ Basic challenges</li>
              <li>✓ DOM XSS</li>
              <li>✓ Auth Bypass</li>
              <li>✗ Advanced challenges</li>
              <li>✗ Priority support</li>
            </ul>
            <button
              disabled
              className="w-full bg-gray-500 text-white py-2 rounded-lg cursor-not-allowed"
            >
              Your Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="border-2 border-blue-500 rounded-lg p-8 bg-slate-800 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 px-4 py-1 rounded-full text-sm font-bold text-white">
              Popular
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Premium</h2>
            <p className="text-gray-400 mb-6">$9.99/month</p>
            <ul className="space-y-3 mb-8 text-gray-300">
              <li>✓ All basic challenges</li>
              <li>✓ Advanced challenges</li>
              <li>✓ JWT Manipulation</li>
              <li>✓ Open Redirect</li>
              <li>✓ iframe Sandbox Bypass</li>
              <li>✓ Priority support</li>
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
                ? 'Processing...'
                : session?.user?.isPaid
                ? '✓ Premium Active'
                : 'Upgrade Now'}
            </button>
          </div>
        </div>

        {!session && (
          <div className="text-center mt-8">
            <p className="text-gray-300">
              <a
                href="/signin"
                className="text-blue-400 hover:underline"
              >
                Sign in
              </a>{' '}
              to upgrade
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
