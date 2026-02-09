'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    phone: session?.user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Please sign in to view your profile</p>
          <Link href="/signin" className="text-blue-400 hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully! 🎉');
        // Refresh session to show updated data
        setTimeout(() => router.refresh(), 1000);
      } else {
        setMessage('Error updating profile: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border border-green-400/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">Your Profile</h1>
          <p className="text-gray-300 mb-6 text-lg">Manage your account details and subscription</p>

          {/* Account Info Section */}
          <div className="mb-8 p-6 bg-slate-900 rounded-lg border border-green-400/10">
            <h2 className="text-xl font-bold text-green-300 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-green-300 font-mono">{session.user?.email}</p>
              </div>
              <div>
                <span className="text-gray-400">Username:</span>
                <p className="text-green-300 font-mono">{session.user?.username}</p>
              </div>
              <div>
                <span className="text-gray-400">Member Since:</span>
                <p className="text-green-300">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="mb-8 p-6 bg-slate-900 rounded-lg border border-green-400/10">
            <h2 className="text-xl font-bold text-green-300 mb-4">Subscription Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-2">Status:</p>
                <p className={`text-lg font-bold ${session.user?.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                  {session.user?.isPaid ? '✓ Premium Active' : 'Free Plan'}
                </p>
              </div>
              {!session.user?.isPaid && (
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Upgrade Now
                </Link>
              )}
            </div>
          </div>

          {/* Edit Details Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">Edit Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-green-400/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-green-400/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes('successfully')
                    ? 'bg-green-900 text-green-300 border border-green-400/30'
                    : 'bg-red-900 text-red-300 border border-red-400/30'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="mt-6">
            <Link
              href="/"
              className="text-blue-400 hover:underline text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
