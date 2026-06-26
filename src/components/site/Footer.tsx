import { Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-white'>
      {/* Dark separator bar */}
      <div className='h-2 bg-gradient-to-r from-[#5A2424] via-[#8B3A3A] to-[#5A2424]' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-8'>
          {/* Left - Hashtag Tagline + Socials */}
          <div className='flex flex-col items-start'>
            <h3 className='text-gray-900 font-gemunu text-xl md:text-2xl font-bold mb-4 leading-tight'>
              #AutomatingChange
              <br />
              AcceleratingImpact
            </h3>
            <div className='space-y-2'>
              <a
                href='https://www.instagram.com/theimd 2026 at itb.itb/'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-gray-600 hover:text-[#5A2424] transition-colors font-gemunu text-sm'
              >
                <Instagram className='h-4 w-4' />
                <span>@theimd 2026 at itb.itb</span>
              </a>
              <a
                href='https://www.linkedin.com/company/the-imd 2026 at itb-by-IMD 2026 at ITB-itb/'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-gray-600 hover:text-[#5A2424] transition-colors font-gemunu text-sm'
              >
                <Linkedin className='h-4 w-4' />
                <span>The IMD 2026 at ITB by IMD 2026 at ITB</span>
              </a>
            </div>
          </div>

          {/* Right - Navigation */}
          <div className='flex flex-col items-start md:items-end'>
            <nav className='flex flex-col space-y-2'>
              <Link
                href='/'
                className='text-gray-700 hover:text-[#5A2424] transition-colors font-gemunu font-semibold text-base'
              >
                Home
              </Link>
              <Link
                href='/#competitions'
                className='text-gray-700 hover:text-[#5A2424] transition-colors font-gemunu font-semibold text-base'
              >
                Competition
              </Link>
              <Link
                href='/#timeline'
                className='text-gray-700 hover:text-[#5A2424] transition-colors font-gemunu font-semibold text-base'
              >
                Event
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className='pt-8 mt-8 border-t border-gray-200'>
          <p className='text-center text-gray-500 text-sm font-gemunu'>
            © 2026 IMD 2026 at ITB IMD 2026 at ITB. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
