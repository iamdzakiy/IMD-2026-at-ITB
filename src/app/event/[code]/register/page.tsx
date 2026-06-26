'use client';

import { ChevronRight, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import EventTicket from '@/components/site/EventTicket';
import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import { type EventContent, getEventContent } from '@/lib/event-content';

interface FormData {
  eventCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institution: string;
}

function RegistrationContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: authStatus } = useSession();
  const eventCode = params.code as string;
  const [eventContent, setEventContent] = useState<EventContent | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [regCheckLoading, setRegCheckLoading] = useState(true);
  const [regClosed, setRegClosed] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Resolve event content
  useEffect(() => {
    const content = getEventContent(eventCode);
    if (!content) {
      router.push('/event');
      return;
    }
    setEventContent(content);
  }, [eventCode, router]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(
        '/login?callbackUrl=' +
          encodeURIComponent(`/event/${eventCode}/register`),
      );
    }
  }, [authStatus, router, eventCode]);

  // Check if user already registered for this event
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    async function checkRegistration() {
      try {
        const res = await fetch('/api/events/register');
        if (res.ok) {
          const data = await res.json();
          const existing = data.registrations?.find(
            (r: { eventCode: string }) => r.eventCode === eventCode,
          );
          if (existing) {
            setRegClosed(
              'You are already registered for this event. Check your dashboard for status.',
            );
          }
        }
      } catch {
        // Allow form to load if check fails
      } finally {
        setRegCheckLoading(false);
      }
    }

    checkRegistration();
  }, [authStatus, eventCode]);

  const [formData, setFormData] = useState<FormData>({
    eventCode,
    fullName: '',
    email: '',
    phoneNumber: '',
    institution: '',
  });

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user?.email || '',
        fullName: session.user?.name || '',
      }));
    }
  }, [session]);

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 3) {
        setError('Full name must be at least 3 characters');
        return false;
      }
      if (
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        setError('Valid email address is required');
        return false;
      }
      if (
        !formData.phoneNumber.trim() ||
        formData.phoneNumber.replace(/\D/g, '').length < 10
      ) {
        setError('Phone number must be at least 10 digits');
        return false;
      }
      if (!formData.institution.trim() || formData.institution.length < 3) {
        setError('Institution/University name is required');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const isSubmitting = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(1)) return;
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setIsLoading(true);
    setError('');

    try {
      const body = new globalThis.FormData();
      body.append('eventCode', formData.eventCode);
      body.append('fullName', formData.fullName);
      body.append('email', formData.email);
      body.append('phoneNumber', formData.phoneNumber);
      body.append('institution', formData.institution);

      const response = await fetch('/api/events/register', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(60000),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            data.error?.message || 'Too many requests. Please try again later.',
          );
        }
        throw new Error(
          data.error?.message || data.error || 'Registration failed',
        );
      }

      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError(
          'Request timeout. Please check your connection and try again.',
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to submit registration',
        );
      }
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  }, [formData]);

  if (
    !eventContent ||
    authStatus === 'loading' ||
    authStatus === 'unauthenticated' ||
    regCheckLoading
  ) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] flex items-center justify-center'>
          <Loader2 className='text-[#FFCD8D] animate-spin' size={40} />
        </div>
        <Footer />
      </>
    );
  }

  if (regClosed) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] pt-32 pb-16 px-4 font-['Gemunu_Libre']">
          <div className='max-w-2xl mx-auto text-center'>
            <div className='backdrop-blur-xl bg-gradient-to-br from-[#5A2424]/40 via-[#3d1a1a]/30 to-[#2d0e0e]/40 rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl'>
              <div className='w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border-2 border-red-500/30 mb-6'>
                <X className='w-10 h-10 text-red-400' />
              </div>
              <h2 className='text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                Registration Unavailable
              </h2>
              <p className='text-gray-400 text-base md:text-lg mb-8'>
                {regClosed}
              </p>
              <Link
                href={`/event/${eventCode}`}
                className='inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B3A3A] to-[#6B2D2D] border-2 border-[#FFCD8D]/30 rounded-2xl text-white font-bold hover:from-[#9B4A4A] hover:to-[#7B3D3D] transition-all duration-300'
              >
                Back to Event
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] pt-28 pb-16 px-4 font-['Gemunu_Libre']">
          <div className='max-w-lg mx-auto'>
            <EventTicket
              eventName={eventContent.name}
              eventDate={eventContent.date}
              attendeeName={formData.fullName}
              attendeeEmail={formData.email}
              institution={formData.institution}
            />

            {/* Action buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
              <Link
                href={`/event/${eventCode}`}
                className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B3A3A] to-[#6B2D2D] border-2 border-[#FFCD8D]/30 rounded-2xl text-white font-bold hover:from-[#9B4A4A] hover:to-[#7B3D3D] transition-all duration-300'
              >
                Back to Event
              </Link>
              <Link
                href='/'
                className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2d0e0e]/60 border-2 border-white/10 rounded-2xl text-white font-bold hover:border-[#FFCD8D]/50 transition-all duration-300'
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] pt-32 pb-16 px-4 font-['Gemunu_Libre']">
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-8 sm:mb-12'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 tracking-wide'>
              Event Registration
            </h1>
            <p className='text-gray-400 text-base sm:text-lg'>
              Register for {eventContent.name}
            </p>
          </div>

          <div className='relative'>
            <div className='absolute -left-4 -top-16 sm:-left-8 sm:-top-20 md:-left-12 md:-top-24 z-20 hidden sm:block'>
              <Image
                src='/mascots/mascot-3.svg'
                alt='Mascot'
                width={200}
                height={200}
                className='w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-2xl'
              />
            </div>

            <div className='relative backdrop-blur-xl bg-gradient-to-br from-[#5A2424]/40 via-[#3d1a1a]/30 to-[#2d0e0e]/40 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border border-white/10 shadow-2xl'>
              {/* Step indicator */}
              <div className='bg-gradient-to-br from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 mb-8'>
                <h2 className='text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Review & Confirm'}
                </h2>

                <div className='flex items-center justify-center gap-1 sm:gap-2'>
                  {['Personal Info', 'Review & Confirm'].map((label, index) => {
                    const step = index + 1;
                    return (
                      <div key={step} className='flex items-center'>
                        <div className='flex flex-col items-center'>
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                              step === currentStep
                                ? 'bg-gradient-to-br from-[#FFCD8D] to-[#E8A05D] text-[#2d0e0e] scale-110 shadow-lg shadow-orange-500/30'
                                : step < currentStep
                                  ? 'bg-[#6B2D2D] text-white border-2 border-[#FFCD8D]/50'
                                  : 'bg-[#3d1a1a]/60 text-gray-500 border-2 border-gray-600/30'
                            }`}
                          >
                            {step}
                          </div>
                          <span className='text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2 max-w-[60px] sm:max-w-[100px] text-center leading-tight'>
                            {label}
                          </span>
                        </div>
                        {step < 2 && (
                          <div
                            className={`w-8 sm:w-16 md:w-24 h-0.5 sm:h-1 mx-0.5 sm:mx-2 rounded-full transition-all ${
                              step < currentStep
                                ? 'bg-gradient-to-r from-[#FFCD8D] to-[#E8A05D]'
                                : 'bg-gray-700/50'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form content */}
              <div className='bg-gradient-to-br from-[#5A2424]/30 to-[#3d1a1a]/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 border border-white/5'>
                {error && (
                  <div className='mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm'>
                    <p className='text-red-200 text-sm'>{error}</p>
                  </div>
                )}

                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className='space-y-6'>
                    <div className='bg-gradient-to-r from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFCD8D]/20'>
                      <h3 className='text-xl font-bold text-[#FFCD8D] mb-1'>
                        {eventContent.name}
                      </h3>
                      <p className='text-xs text-gray-400'>
                        {eventContent.date} • {eventContent.venue}
                      </p>
                    </div>

                    <div>
                      <label className='block text-white mb-2 text-sm font-medium'>
                        Full Name <span className='text-[#FFCD8D]'>*</span>
                      </label>
                      <input
                        type='text'
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder='Enter your full name'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300'
                      />
                    </div>

                    <div>
                      <label className='block text-white mb-2 text-sm font-medium'>
                        Email <span className='text-[#FFCD8D]'>*</span>
                      </label>
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder='your@email.com'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300'
                      />
                    </div>

                    <div>
                      <label className='block text-white mb-2 text-sm font-medium'>
                        Phone Number <span className='text-[#FFCD8D]'>*</span>
                      </label>
                      <input
                        type='tel'
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder='e.g. 08123456789'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300'
                      />
                    </div>

                    <div>
                      <label className='block text-white mb-2 text-sm font-medium'>
                        Institution / School / University{' '}
                        <span className='text-[#FFCD8D]'>*</span>
                      </label>
                      <input
                        type='text'
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            institution: e.target.value,
                          }))
                        }
                        placeholder='Full name of your institution'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300'
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Review & Confirm */}
                {currentStep === 2 && (
                  <div className='space-y-6'>
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-8 border border-white/10'>
                      <h3 className='text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                        {eventContent.name}
                      </h3>
                      <p className='text-center text-gray-400 mb-6 text-lg'>
                        {eventContent.date} • {eventContent.venue}
                      </p>

                      <div className='border-t border-white/10 pt-6'>
                        <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                          Personal Information
                        </h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Full Name:</span>
                            <span className='text-white font-medium'>
                              {formData.fullName}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Email:</span>
                            <span className='text-white'>{formData.email}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Phone:</span>
                            <span className='text-white'>
                              {formData.phoneNumber}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Institution:</span>
                            <span className='text-white'>
                              {formData.institution}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='text-center text-sm text-gray-400 bg-[#2d0e0e]/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5'>
                      ℹ️ Your registration will be processed instantly. A
                      confirmation email will be sent to your inbox.
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className='flex justify-between items-center mt-10 gap-4'>
                  {currentStep > 1 && (
                    <button
                      type='button'
                      onClick={handleBack}
                      disabled={isLoading}
                      className='px-8 py-4 bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 rounded-2xl text-white hover:border-[#FFCD8D]/50 hover:bg-[#3d1a1a]/60 transition-all duration-300 disabled:opacity-50 font-medium'
                    >
                      Back
                    </button>
                  )}

                  {currentStep === 1 && <div />}

                  {currentStep < 2 ? (
                    <button
                      type='button'
                      onClick={handleNext}
                      disabled={isLoading}
                      className='flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B4513] to-[#6B2D2D] border-2 border-[#FFCD8D]/30 rounded-2xl text-white hover:from-[#9B5523] hover:to-[#7B3D3D] transition-all duration-300 shadow-lg shadow-orange-900/20 disabled:opacity-50 ml-auto font-bold'
                    >
                      <span>Review</span>
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className='flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-[#FFCD8D] via-[#E8A05D] to-[#FFCD8D] rounded-2xl text-[#2d0e0e] font-bold hover:from-[#FFD9A3] hover:via-[#F0B070] hover:to-[#FFD9A3] transition-all duration-300 shadow-xl shadow-orange-500/30 disabled:opacity-50 ml-auto text-lg'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='animate-spin' size={22} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function EventRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#0B0102] flex items-center justify-center'>
          <Loader2 className='text-[#FFCD8D] animate-spin' size={40} />
        </div>
      }
    >
      <RegistrationContent />
    </Suspense>
  );
}
