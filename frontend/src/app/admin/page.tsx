'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/context';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    const success = await login(password);

    if (success) {
      router.push('/');
    } else {
      setLoginError('Invalid password');
    }
    setLoading(false);
  };

  // If already admin, show loading while redirecting
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bella-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy">Admin Access</h1>
          <p className="text-bella-500 text-sm mt-2">Enter password to enable editing mode</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bella-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {loginError && (
            <p className="text-red-500 text-sm text-center">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-navy text-white py-3 rounded-lg font-medium hover:bg-navy-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-bella-100">
          <h3 className="text-sm font-semibold text-navy mb-3">What you can do as admin:</h3>
          <ul className="text-sm text-bella-600 space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Click on any image to replace it
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Click on editable text to change it
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Upload images or use URLs
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-bella-500 hover:text-navy">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
