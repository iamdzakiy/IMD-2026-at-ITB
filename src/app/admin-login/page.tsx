'use client';

import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * ============================================================================
 * ADMIN LOGIN PAGE
 * ============================================================================
 *
 * Dedicated login page for admin/staff access
 * Uses 'admin-credentials' provider (credentials only, no OAuth)
 *
 * Route: /admin-login
 * Redirects to: /admin/dashboard
 * ============================================================================
 */

export default function AdminLoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/admin/dashboard');
  const [mounted, setMounted] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get callback URL from query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callbackUrl');
    if (callback) {
      setCallbackUrl(callback);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('admin-credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - force full page reload to ensure session is set
      window.location.href = callbackUrl;
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background Blobs */}
      <div className='absolute inset-0 pointer-events-none'>
        <Image
          src='/hero/hero-circle-1.svg'
          alt=''
          width={600}
          height={600}
          className='absolute top-1/2 -translate-y-1/2 -left-1/4 opacity-40'
        />
        <Image
          src='/hero/hero-circle-2.svg'
          alt=''
          width={600}
          height={600}
          className='absolute top-1/2 -translate-y-1/2 -right-1/4 opacity-40'
        />
      </div>

      {/* Login Card */}
      <div className='relative w-full max-w-md'>
        <div className='backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl'>
          {/* Admin Badge */}
          <div className='flex items-center justify-center mb-6'>
            <div className='bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full'>
              <Shield className='w-12 h-12 text-white' />
            </div>
          </div>

          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>Admin Portal</h1>
            <p className='text-gray-300'>
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className='space-y-5'>
            {/* Error Message */}
            {error && (
              <div className='bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-200 mb-2'
              >
                Username
              </label>
              <input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                placeholder='Enter your username'
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-200 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                  placeholder='Enter your password'
                  required
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className='text-center text-sm text-gray-400 mt-6'>
            For authorized staff only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
