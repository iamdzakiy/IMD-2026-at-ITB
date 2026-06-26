'use client';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';

export default function NotFoundPage() {
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102]'>
      <Navbar />
      <main className='relative flex-grow flex items-center justify-center overflow-hidden px-4 py-20 max-w-[1440px] mx-auto w-full'>
        {/* Background Blobs */}
        {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/hero/hero-circle-1.svg"
            alt=""
            width={800}
            height={800}
            className="absolute top-1/2 -translate-y-1/2 -left-1/4 md:-left-1/3 lg:-left-1/4 opacity-50"
            priority
          />
          <Image
            src="/hero/hero-circle-2.svg"
            alt=""
            width={800}
            height={800}
            className="absolute top-1/2 -translate-y-1/2 -right-1/4 md:-right-1/3 lg:-right-1/4 opacity-50"
            priority
          />
        </div> */}

        {/* Content */}
        <div className='relative z-10 text-center max-w-6xl mx-auto'>
          <div className='relative inline-block'>
            {/* Mascot Left - Behind text */}
            <Image
              src='/mascots/mascot-2.svg'
              alt='Mascot'
              width={300}
              height={300}
              className='absolute -left-16 sm:-left-24 md:-left-48 lg:-left-64 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-56 md:h-56 lg:w-72 lg:h-72 animate-float-gentle z-0'
              style={{ transform: 'translateY(-50%) rotate(-12deg)' }}
              priority
            />

            {/* Main Text */}
            <div className='relative z-10 mb-6 md:mb-8'>
              <h1
                className='text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-gemunu tracking-wider mb-4'
                style={{
                  background:
                    'linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(255, 205, 141, 0.5))',
                }}
              >
                404 Not Found
              </h1>
              <p className='text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/90 font-gemunu'>
                Fixing there and there....
              </p>
            </div>

            {/* Mascot Right - In front of text */}
            <Image
              src='/mascots/mascot-6.svg'
              alt='Mascot'
              width={300}
              height={300}
              className='absolute -right-16 sm:-right-24 md:-right-48 lg:-right-64 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-56 md:h-56 lg:w-72 lg:h-72 animate-float-gentle-reverse z-20'
              style={{ transform: 'translateY(-50%) rotate(15deg)' }}
              priority
            />
          </div>

          {/* Home Button */}
          <div className='mt-12 md:mt-16'>
            <Link
              href='/'
              className='inline-block h-[35px] px-8 rounded-full font-gemunu text-base md:text-lg font-semibold transition-all hover:scale-105'
              style={{
                background: 'linear-gradient(90deg, #FFCD8D 0%, #280003 100%)',
                boxShadow:
                  '0 8px 24px rgba(255, 205, 141, 0.4), 0 4px 12px rgba(40, 0, 3, 0.3)',
                lineHeight: '35px',
                color: 'white',
              }}
            >
              Home
            </Link>
          </div>
        </div>

        {/* Floating Animation CSS */}
        <style jsx>{`
          @keyframes floatGentle {
            0%,
            100% {
              transform: translateY(-50%) rotate(-12deg) translateY(0px);
            }
            50% {
              transform: translateY(-50%) rotate(-12deg) translateY(-20px);
            }
          }

          @keyframes floatGentleReverse {
            0%,
            100% {
              transform: translateY(-50%) rotate(15deg) translateY(0px);
            }
            50% {
              transform: translateY(-50%) rotate(15deg) translateY(-20px);
            }
          }

          :global(.animate-float-gentle) {
            animation: floatGentle 4s ease-in-out infinite;
          }

          :global(.animate-float-gentle-reverse) {
            animation: floatGentleReverse 4s ease-in-out infinite;
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}
