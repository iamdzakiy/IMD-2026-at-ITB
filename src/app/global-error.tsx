'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function GlobalError({
  // eslint-disable-next-line unused-imports/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className='relative flex h-screen overflow-hidden w-full bg-[#0F3015] flex-col items-center justify-center px-10'>
          {/* Decorative elements */}
          <Image
            src='/error/bucket1.png'
            className='absolute -right-20 lg:right-2 w-[50%] sm:w-[20%] top-20 object-contain transition-all duration-300 opacity-80'
            alt='Decorative bucket'
            width={744}
            height={642}
          />
          <Image
            src='/error/bucket2.png'
            className='absolute right-0 -top-14 w-[25%] sm:w-[10%] aspect-square object-contain -translate-x-10 opacity-50 transition-all duration-300'
            alt='Decorative ring'
            width={199}
            height={199}
          />

          {/* Main Content */}
          <div className='relative z-10 flex flex-col items-center justify-center gap-6 lg:gap-8'>
            {/* Mascots and Headline Container */}
            <div className='flex items-center justify-center gap-4 lg:gap-8'>
              {/* Left Mascot */}
              <Image
                src={'/404assets/sand.png'}
                alt='IMD 2026 at ITB Mascot'
                className='object-contain animate-shake w-[80px] h-[160px] sm:w-[100px] sm:h-[200px] lg:w-[120px] lg:h-[240px] transition-all duration-300'
                width={165}
                height={220}
              />

              {/* Headline */}
              <div className='flex flex-col items-center'>
                <h1 className='font-poppins italic lg:text-7xl text-5xl tracking-wide text-center font-extrabold text-white transition-all duration-300'>
                  404
                </h1>
                <h2 className='font-poppins italic text-xl lg:text-3xl text-center font-bold text-white transition-all duration-300'>
                  Not Found
                </h2>
              </div>

              {/* Right Mascot */}
              <Image
                src={'/404assets/sand.png'}
                alt='IMD 2026 at ITB Mascot'
                className='object-contain animate-shake w-[80px] h-[160px] sm:w-[100px] sm:h-[200px] lg:w-[120px] lg:h-[240px] transition-all duration-300'
                width={165}
                height={220}
              />
            </div>

            {/* Subtitle */}
            <p className='font-poppins text-base lg:text-xl text-center text-white/90 max-w-md transition-all duration-300'>
              Fixing there and there...
            </p>

            {/* Action Buttons */}
            <div className='font-poppins items-center justify-center text-white text-base mt-4 lg:mt-6 flex flex-col gap-4'>
              <button
                onClick={() => reset()}
                className='bg-gradient-to-r from-[#DBB88B] to-[#AB814E] hover:from-[#AB814E] hover:to-[#8B6F3E] text-white px-8 py-3 rounded-full font-gemunu text-lg font-semibold transition-all shadow-lg hover:shadow-xl'
              >
                Try Again
              </button>
              <Link
                href='/'
                className='text-[#DBB88B] hover:text-[#AB814E] underline transition-all'
              >
                Go Back Home
              </Link>
            </div>
          </div>

          {/* Bottom decorations */}
          <Image
            src='/404assets/Bintang_jatuh.svg'
            className='absolute rotate-[165deg] bottom-0 left-0 object-contain w-[20%] sm:-translate-x-10 -translate-x-20 -translate-y-10 transition-all duration-300 opacity-60'
            alt='Shooting star'
            width={744}
            height={642}
          />
          <Image
            src='/404assets/Vector_155.svg'
            className='absolute bottom-0 left-1 object-contain w-[25%] sm:w-[13%] sm:translate-x-10 translate-x-15 -translate-y-5 transition-all duration-300 opacity-60'
            alt='Comet'
            width={236}
            height={206}
          />
        </main>
      </body>
    </html>
  );
}
