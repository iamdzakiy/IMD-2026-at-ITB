'use client';

import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';

/**
 * ============================================================================
 * USER REGISTRATION PAGE
 * ============================================================================
 *
 * Public registration form for new users
 * Supports credentials and Google OAuth
 * Sends activation email after successful registration
 *
 * Route: /register
 * ============================================================================
 */

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      await signIn('google', {
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('Google registration error:', err);
      setError('Google registration failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen bg-[#0B0102] pt-24 pb-16 px-4'>
          <div className='max-w-2xl mx-auto'>
            {/* Success Container */}
            <div className='relative'>
              {/* Mascot Character */}
              <div className='absolute -left-2 -top-10 sm:-left-4 sm:-top-12 md:-left-16 md:-top-16 z-10 hidden sm:block'>
                <Image
                  src='/mascots/mascot-3.svg'
                  alt='Mascot'
                  width={180}
                  height={180}
                  className='w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44'
                />
              </div>

              <div className='bg-gradient-to-br from-[#2d0609]/80 to-[#190204]/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-[#8B3A3A]/30'>
                {/* Success Icon */}
                <div className='flex justify-center mb-6'>
                  <div className='w-24 h-24 rounded-full bg-gradient-to-br from-[#FFCD8D] to-[#DBB88B] flex items-center justify-center shadow-lg shadow-[#FFCD8D]/20'>
                    <CheckCircle2 size={56} className='text-[#190204]' />
                  </div>
                </div>

                {/* Success Message */}
                <h1
                  className='text-2xl sm:text-4xl font-bold text-center mb-4'
                  style={{
                    background:
                      'linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Registration Successful!
                </h1>

                <p className='text-[#E8B4A8] text-center mb-8 text-lg'>
                  Thank you for registering! Please check your email to activate
                  your account.
                </p>

                {/* What's Next Info */}
                <div className='bg-[#2d0609]/60 rounded-2xl p-6 border border-[#8B3A3A]/30 mb-8'>
                  <h3 className='text-[#FFCD8D] font-semibold mb-3 text-center'>
                    What&apos;s Next?
                  </h3>
                  <div className='space-y-3 text-[#E8B4A8] text-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <span className='text-white text-xs font-bold'>1</span>
                      </div>
                      <p>
                        Check your email at{' '}
                        <span className='text-[#FFCD8D] font-medium'>
                          {formData.email}
                        </span>{' '}
                        for an activation link
                      </p>
                    </div>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <span className='text-white text-xs font-bold'>2</span>
                      </div>
                      <p>
                        Click the activation link to verify your account (link
                        expires in 24 hours)
                      </p>
                    </div>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <span className='text-white text-xs font-bold'>3</span>
                      </div>
                      <p>
                        Login and register for competitions once your account is
                        activated
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className='bg-[#8B3A3A]/20 border border-[#8B3A3A]/50 rounded-xl p-4 mb-8'>
                  <p className='text-[#FFCD8D] text-sm text-center'>
                    ⚠️ <strong>Important:</strong> Please check your spam/junk
                    folder if you don&apos;t see the email in your inbox within
                    a few minutes.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Link
                    href='/login'
                    className='px-6 py-3 bg-gradient-to-r from-[#FFCD8D] to-[#DBB88B] rounded-xl text-[#190204] font-bold text-center hover:from-[#FFD9A3] hover:to-[#EBC89B] transition-all shadow-lg'
                  >
                    Go to Login
                  </Link>
                  <Link
                    href='/'
                    className='px-6 py-3 bg-[#2d0609]/80 border border-[#8B3A3A]/40 rounded-xl text-[#E8B4A8] text-center hover:border-[#FFCD8D]/50 hover:text-[#FFCD8D] transition-all'
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className='mt-8 text-center'>
              <p className='text-[#9b7a6f] text-sm'>
                Need help? Contact us at{' '}
                <a
                  href='mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org'
                  className='text-[#FFCD8D] hover:underline'
                >
                  imd 2026 at itb@IMD 2026 at ITB-itb.org
                </a>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Registration Form
  return (
    <>
      <Navbar />
      <div className='relative min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] flex items-center justify-center py-20 px-4'>
        {/* Background Blobs */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <Image
            src='/hero/hero-circle-1.svg'
            alt=''
            width={800}
            height={800}
            className='absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 opacity-30 animate-float-slow'
            priority
          />
          <Image
            src='/hero/hero-circle-2.svg'
            alt=''
            width={800}
            height={800}
            className='absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 opacity-30 animate-float-slow-reverse'
            priority
          />
        </div>

        {/* Glass Card Container */}
        <div className='relative z-10 w-full max-w-2xl'>
          <div
            className='relative backdrop-blur-[40px] bg-white/[0.08] rounded-2xl sm:rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(77,77,77,0.37)] p-6 sm:p-8 md:p-12'
            style={{
              boxShadow: '0 8px 32px 0 rgba(77, 77, 77, 0.37)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            {/* Header */}
            <div className='text-center mb-8'>
              <h1 className='text-3xl md:text-4xl font-bold text-white mb-2 font-gemunu'>
                Create Your Account
              </h1>
              <p className='text-white/70 font-gemunu text-sm md:text-base'>
                Join the competition and showcase your skills
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
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Email */}
              <div>
                <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                  Email Address
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 font-gemunu'
                  placeholder='john@example.com'
                />
              </div>

              {/* Full Name */}
              <div>
                <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                  Full Name
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 font-gemunu'
                  placeholder='John Doe'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Password */}
                <div>
                  <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
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
                  <p className='text-xs text-white/50 mt-1 font-gemunu'>
                    Min. 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className='block text-white/90 font-gemunu mb-2 text-sm'>
                    Confirm Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 font-gemunu pr-12'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white'
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className='bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm font-gemunu'>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
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
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-white/10'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-transparent text-white/50 font-gemunu'>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type='button'
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className='w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-gemunu transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isGoogleLoading ? (
                  <Loader2 className='animate-spin' size={20} />
                ) : (
                  <>
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path
                        fill='#EA4335'
                        d='M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z'
                      />
                      <path
                        fill='#34A853'
                        d='M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z'
                      />
                      <path
                        fill='#4A90E2'
                        d='M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z'
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className='text-center text-white/70 font-gemunu text-sm'>
                Already have an account?{' '}
                <Link
                  href='/login'
                  className='text-white font-semibold hover:underline'
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Floating Animation CSS */}
        <style jsx>{`
          @keyframes floatSlow {
            0%,
            100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-30px);
            }
          }

          @keyframes floatSlowReverse {
            0%,
            100% {
              transform: translate(50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(50%, -50%) translateY(-30px);
            }
          }

          :global(.animate-float-slow) {
            animation: floatSlow 20s ease-in-out infinite;
          }

          :global(.animate-float-slow-reverse) {
            animation: floatSlowReverse 20s ease-in-out infinite;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}
