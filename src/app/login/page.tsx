'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';

/**
 * ============================================================================
 * USER LOGIN PAGE
 * ============================================================================
 *
 * Public login page for registered users
 * Supports credentials (username/email + password) and Google OAuth
 *
 * Route: /login
 * ============================================================================
 */

export default function LoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/');
  const [mounted, setMounted] = useState(false);

  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callbackUrl');
    if (callback) {
      setCallbackUrl(callback);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('user-credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth error codes to user-friendly messages
        if (
          result.error === 'CredentialsSignin' ||
          result.error === 'CallbackRouteError'
        ) {
          setError('Incorrect email or password. Please try again.');
        } else if (result.error === 'AccessDenied') {
          setError(
            'Account is not activated. Please check your email for the activation link.',
          );
        } else {
          setError('Login failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }
      // Use window.location for full page reload to ensure session is set
      window.location.href = callbackUrl;
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      await signIn('google', {
        callbackUrl,
      });
    } catch (err) {
      setError('Google login failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] flex items-center justify-center p-4 pt-24 pb-24 relative overflow-hidden'>
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

        <div className='max-w-lg w-full relative z-10'>
          {/* Glass Card */}
          <div
            className='backdrop-blur-[40px] bg-white/[0.08] rounded-2xl sm:rounded-[32px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 sm:p-8 md:p-12'
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            {/* Header */}
            <div className='text-center mb-8'>
              <h1 className='text-3xl md:text-4xl font-bold text-white mb-2 font-gemunu'>
                Hi, Welcome Back
              </h1>
              <p className='text-white/70 font-gemunu text-sm md:text-base'>
                Enter your email and password to access your account
              </p>
            </div>

            {/* Logo */}
            <div className='flex justify-center mb-8'>
              <Image
                src='/logo/logo-white.svg'
                alt='IMD 2026 at ITB Logo'
                width={80}
                height={80}
                className='w-16 h-16'
              />
            </div>

            {/* Form */}
            <form onSubmit={handleCredentialsLogin} className='space-y-6'>
              {/* Email Field */}
              <div>
                <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                  Email
                </label>
                <input
                  type='text'
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className='w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 font-gemunu'
                  placeholder='Enter your email'
                />
              </div>

              {/* Password Field */}
              <div>
                <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 font-gemunu pr-12'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white'
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className='text-right'>
                <Link
                  href='/forgot-password'
                  className='text-white/70 hover:text-white text-sm font-gemunu'
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className='bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm font-gemunu'>
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type='submit'
                disabled={isLoading || isGoogleLoading}
                className='w-full h-[35px] rounded-full font-gemunu text-base font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                style={{
                  background:
                    'linear-gradient(90deg, #FFCD8D 0%, #280003 100%)',
                  boxShadow:
                    '0 8px 24px rgba(255, 205, 141, 0.4), 0 4px 12px rgba(40, 0, 3, 0.3)',
                  color: 'white',
                }}
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <Loader2 className='animate-spin mr-2' size={16} />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Google Sign In */}
              <button
                type='button'
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className='w-full h-[35px] flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-gemunu text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isGoogleLoading ? (
                  <Loader2 className='animate-spin mr-2' size={16} />
                ) : (
                  <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                )}
                Sign in with Google
              </button>

              {/* Register Link */}
              <div className='text-center text-white/70 font-gemunu text-sm'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/register'
                  className='text-white font-semibold hover:underline'
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
