'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const needsActivation = searchParams.get('needsActivation') === 'true';

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
                className='w-32 h-32 md:w-44 md:h-44'
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
                Thank you for registering! Your team information has been
                submitted.
              </p>

              {/* What's Next Info */}
              <div className='bg-[#2d0609]/60 rounded-2xl p-6 border border-[#8B3A3A]/30 mb-8'>
                <h3 className='text-[#FFCD8D] font-semibold mb-3 text-center'>
                  What&apos;s Next?
                </h3>
                <div className='space-y-3 text-[#E8B4A8] text-sm'>
                  {needsActivation ? (
                    <>
                      {/* For new users - show email activation steps */}
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            1
                          </span>
                        </div>
                        <p>
                          Check your email at{' '}
                          <span className='text-[#FFCD8D] font-medium'>
                            {email || 'your registered email'}
                          </span>{' '}
                          for an activation link
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            2
                          </span>
                        </div>
                        <p>
                          Click the activation link to verify your account (link
                          expires in 24 hours)
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            3
                          </span>
                        </div>
                        <p>
                          Our team will review your registration within 24 hours
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            4
                          </span>
                        </div>
                        <p>
                          You&apos;ll receive a confirmation email once your
                          registration is approved
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* For existing users - show admin review steps */}
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            1
                          </span>
                        </div>
                        <p>
                          Our team will review your team registration within 24
                          hours
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            2
                          </span>
                        </div>
                        <p>
                          You&apos;ll receive a confirmation email at{' '}
                          <span className='text-[#FFCD8D] font-medium'>
                            {email || 'your registered email'}
                          </span>{' '}
                          once approved
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            3
                          </span>
                        </div>
                        <p>
                          After approval, you can proceed with abstract/proposal
                          submission
                        </p>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-[#8B3A3A] flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='text-white text-xs font-bold'>
                            4
                          </span>
                        </div>
                        <p>Track your registration status in your dashboard</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Important Notice */}
              {needsActivation && (
                <div className='bg-[#8B3A3A]/20 border border-[#8B3A3A]/50 rounded-xl p-4 mb-8'>
                  <p className='text-[#FFCD8D] text-sm text-center'>
                    ⚠️ <strong>Important:</strong> Please check your spam/junk
                    folder if you don&apos;t see the email in your inbox within
                    a few minutes.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/dashboard'
                  className='px-6 py-3 bg-gradient-to-r from-[#FFCD8D] to-[#DBB88B] rounded-xl text-[#190204] font-bold text-center hover:from-[#FFD9A3] hover:to-[#EBC89B] transition-all shadow-lg'
                >
                  Go to Dashboard
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
                href='mailto:support@imd 2026 at itbieee.com'
                className='text-[#FFCD8D] hover:underline'
              >
                support@imd 2026 at itbieee.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#0B0102] flex items-center justify-center'>
          <div className='text-[#FFCD8D]'>Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
