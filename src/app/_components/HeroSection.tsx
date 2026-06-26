'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  deadline: Date;
}

export default function HeroSection({ deadline }: HeroSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [deadline]);

  const scrollToCompetitions = () => {
    document
      .getElementById('competitions')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102]'>
      {/* Background Blobs */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <Image
          src='/hero/hero-circle-1.svg'
          alt=''
          width={800}
          height={800}
          className='absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 opacity-70 animate-float-slow'
          priority
        />
        <Image
          src='/hero/hero-circle-2.svg'
          alt=''
          width={800}
          height={800}
          className='absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 opacity-70 animate-float-slow-reverse'
          priority
        />
      </div>

      {/* Glass Card */}
      <div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32'>
        <div
          className='relative backdrop-blur-[99px] bg-white/[0.08] rounded-3xl md:rounded-[99px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 sm:p-8 md:p-12 lg:p-16'
          style={{
            boxShadow: '0 8px 32px 0 rgba(77, 77, 77, 0.37)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* Logo */}
          <div className='flex justify-center mb-8 md:mb-12'>
            <Image
              src='/logo/logo-white.svg'
              alt='IMD 2026 at ITB Logo'
              width={80}
              height={80}
              className='w-16 h-16 md:w-20 md:h-20'
              priority
            />
          </div>

          {/* Title with Mascots */}
          <div className='relative flex items-center justify-center mb-12 md:mb-16'>
            {/* Mascot 1 - Left */}
            <Image
              src='/mascots/mascot-1.svg'
              alt='Mascot'
              width={200}
              height={200}
              className='absolute left-0 md:left-8 lg:left-16 w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-float-gentle z-10'
              priority
            />

            {/* Competition Text */}
            <h1
              className='text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-gemunu tracking-wider relative z-20 px-4'
              style={{
                background: 'linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(255, 205, 141, 0.5))',
              }}
            >
              Competition
            </h1>

            {/* Mascot 2 - Right */}
            <Image
              src='/mascots/mascot-2.svg'
              alt='Mascot'
              width={200}
              height={200}
              className='absolute right-0 md:right-8 lg:right-16 w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-float-gentle z-10'
              priority
            />
          </div>

          {/* Countdown */}
          <div className='text-center mb-4 sm:mb-6'>
            <div className='inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 backdrop-blur-sm'>
              <span className='relative flex h-2.5 w-2.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75' />
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400' />
              </span>
              <span className='text-amber-200 font-gemunu font-bold text-sm sm:text-base tracking-wide'>
                Extended Registration — Until March 16, 2026
              </span>
            </div>
          </div>
          <div className='flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-8 md:mb-12'>
            <div className='text-center'>
              <div className='text-white/70 text-xs sm:text-sm md:text-base font-gemunu mb-2'>
                Days
              </div>
              <div className='bg-black/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border border-white/10'>
                <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-gemunu'>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-white/50 font-gemunu'>
              :
            </div>

            <div className='text-center'>
              <div className='text-white/70 text-xs sm:text-sm md:text-base font-gemunu mb-2'>
                Hours
              </div>
              <div className='bg-black/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border border-white/10'>
                <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-gemunu'>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-white/50 font-gemunu'>
              :
            </div>

            <div className='text-center'>
              <div className='text-white/70 text-xs sm:text-sm md:text-base font-gemunu mb-2'>
                Minutes
              </div>
              <div className='bg-black/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border border-white/10'>
                <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-gemunu'>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Explore Now Button */}
          <div className='flex justify-center'>
            <button
              onClick={scrollToCompetitions}
              className='group relative h-[35px] px-8 rounded-full font-gemunu text-base md:text-lg font-semibold transition-all hover:scale-105 overflow-hidden'
              style={{
                background: 'linear-gradient(90deg, #FFCD8D 0%, #280003 100%)',
                boxShadow:
                  '0 8px 24px rgba(255, 205, 141, 0.4), 0 4px 12px rgba(40, 0, 3, 0.3)',
              }}
            >
              <span className='relative z-10 text-white'>Explore Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Mascots Animation CSS */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-200%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          0% {
            transform: translateX(200%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-20px) translateX(0px);
          }
          75% {
            transform: translateY(-10px) translateX(-5px);
          }
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-20px, 30px) scale(1.05);
          }
          66% {
            transform: translate(20px, -20px) scale(0.95);
          }
        }

        @keyframes floatSlowReverse {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        :global(.animate-slide-in-left) {
          animation:
            slideInLeft 1.5s ease-out forwards,
            float 6s ease-in-out infinite 1.5s;
        }

        :global(.animate-slide-in-right) {
          animation:
            slideInRight 1.5s ease-out forwards,
            float 6s ease-in-out infinite 1.5s;
        }

        :global(.animate-float-slow) {
          animation: floatSlow 20s ease-in-out infinite;
        }

        :global(.animate-float-slow-reverse) {
          animation: floatSlowReverse 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
