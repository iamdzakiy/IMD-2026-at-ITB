'use client';

import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isCompetitionOpen, setIsCompetitionOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCompetitionOpen, setIsMobileCompetitionOpen] = useState(false);
  const [isMobileEventsOpen, setIsMobileEventsOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const SCROLL_THRESHOLD = 15;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Don't hide when any dropdown or mobile menu is open
      if (
        isMobileMenuOpen ||
        isCompetitionOpen ||
        isEventsOpen ||
        isProfileOpen
      ) {
        setPrevScrollY(currentScrollY);
        return;
      }

      // Always show at top
      if (currentScrollY < 60) {
        setIsNavVisible(true);
        setPrevScrollY(currentScrollY);
        return;
      }

      const delta = currentScrollY - prevScrollY;

      if (delta > SCROLL_THRESHOLD) {
        // Scrolling DOWN past threshold — hide
        setIsNavVisible(false);
      } else if (delta < -SCROLL_THRESHOLD) {
        // Scrolling UP past threshold — show
        setIsNavVisible(true);
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    prevScrollY,
    isMobileMenuOpen,
    isCompetitionOpen,
    isEventsOpen,
    isProfileOpen,
  ]);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
            : 'bg-white border-b border-gray-200'
        }`}
        style={{
          transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms, box-shadow 300ms',
        }}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-20'>
            {/* Logo */}
            <Link href='/' className='flex items-center'>
              <Image
                src='/logo/logo-white.svg'
                alt='IMD 2026 at ITB Logo'
                width={50}
                height={50}
                className='h-12 w-auto brightness-0'
              />
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-8'>
              <Link
                href='/'
                className='text-gray-700 hover:text-[#FF6B7A] transition-colors font-gemunu text-lg font-medium'
              >
                Home
              </Link>

              {/* Competition Dropdown */}
              <div className='relative'>
                <button
                  onClick={() => setIsCompetitionOpen(!isCompetitionOpen)}
                  className='flex items-center text-gray-700 hover:text-[#FF6B7A] transition-colors font-gemunu text-lg font-medium'
                >
                  Competitions
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isCompetitionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCompetitionOpen && (
                  <div className='absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50'>
                    <Link
                      href='/competitions/ptc'
                      className='block px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                      onClick={() => setIsCompetitionOpen(false)}
                    >
                      ProtoTech Competition
                    </Link>
                    <Link
                      href='/competitions/tpc'
                      className='block px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                      onClick={() => setIsCompetitionOpen(false)}
                    >
                      Technovate Paper Competition
                    </Link>
                    <Link
                      href='/competitions/bcc'
                      className='block px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                      onClick={() => setIsCompetitionOpen(false)}
                    >
                      Business Case Competition
                    </Link>
                  </div>
                )}
              </div>

              {/* Events Dropdown */}
              <div className='relative'>
                <button
                  onClick={() => setIsEventsOpen(!isEventsOpen)}
                  className='flex items-center text-gray-700 hover:text-[#FF6B7A] transition-colors font-gemunu text-lg font-medium'
                >
                  Events
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isEventsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isEventsOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50'>
                    <Link
                      href='/event/yif-x-grand-seminar'
                      className='block px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                      onClick={() => setIsEventsOpen(false)}
                    >
                      YIF & Grand Seminar
                    </Link>
                    <span
                      className='block px-4 py-3 text-gray-400 cursor-not-allowed font-gemunu'
                      title='Coming soon'
                    >
                      Exhibition & Post Event
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Desktop auth + Mobile hamburger */}
            <div className='flex items-center gap-3'>
              {/* Desktop Sign In / Profile */}
              <div className='hidden md:block'>
                {status === 'loading' ? (
                  <div className='h-[35px] w-24 bg-gray-200 animate-pulse rounded-full' />
                ) : session?.user ? (
                  <div className='relative'>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className='h-[35px] flex items-center gap-2 bg-gradient-to-r from-[#8B2635] to-[#5A1623] hover:from-[#9B3645] hover:to-[#6A2633] text-white px-6 rounded-full font-gemunu text-base font-semibold transition-all shadow-lg hover:shadow-xl'
                    >
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={20}
                          height={20}
                          className='rounded-full'
                        />
                      ) : (
                        <User className='w-4 h-4' />
                      )}
                      Profile
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isProfileOpen && (
                      <div className='absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50'>
                        <div className='px-4 py-3 border-b border-gray-200'>
                          <p className='text-sm font-semibold text-gray-900 truncate'>
                            {session.user.name}
                          </p>
                          <p className='text-xs text-gray-500 truncate'>
                            @{session.user.username}
                          </p>
                        </div>

                        <Link
                          href='/profile'
                          className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className='w-4 h-4' />
                          My Profile
                        </Link>

                        <Link
                          href='/dashboard'
                          className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 transition-colors font-gemunu'
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ChevronDown className='w-4 h-4 rotate-90' />
                          My Competition
                        </Link>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className='w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-gemunu border-t border-gray-200'
                        >
                          <LogOut className='w-4 h-4' />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href='/login'
                    className='h-[35px] flex items-center bg-gradient-to-r from-[#8B2635] to-[#5A1623] hover:from-[#9B3645] hover:to-[#6A2633] text-white px-6 rounded-full font-gemunu text-base font-semibold transition-all shadow-lg hover:shadow-xl'
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 text-gray-700 hover:text-[#FF6B7A] transition-colors'
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className='w-6 h-6' />
                ) : (
                  <Menu className='w-6 h-6' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close desktop dropdowns */}
        {(isCompetitionOpen || isEventsOpen || isProfileOpen) && (
          <div
            className='fixed inset-0 z-40'
            onClick={() => {
              setIsCompetitionOpen(false);
              setIsEventsOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )}
      </nav>

      {/* Mobile Menu — rendered outside nav to avoid backdrop-blur containing block */}
      {isMobileMenuOpen && (
        <div className='md:hidden fixed inset-0 top-20 z-[60] bg-white border-t border-gray-200 overflow-y-auto'>
          <div className='px-4 py-6 space-y-1'>
            <Link
              href='/'
              className='block px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-xl transition-colors font-gemunu text-lg font-medium'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Competitions Accordion */}
            <div>
              <button
                onClick={() =>
                  setIsMobileCompetitionOpen(!isMobileCompetitionOpen)
                }
                className='w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-xl transition-colors font-gemunu text-lg font-medium'
              >
                Competitions
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isMobileCompetitionOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isMobileCompetitionOpen && (
                <div className='ml-4 space-y-1 mt-1'>
                  <Link
                    href='/competitions/ptc'
                    className='block px-4 py-2.5 text-gray-600 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-lg transition-colors font-gemunu'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ProtoTech Competition
                  </Link>
                  <Link
                    href='/competitions/tpc'
                    className='block px-4 py-2.5 text-gray-600 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-lg transition-colors font-gemunu'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Technovate Paper Competition
                  </Link>
                  <Link
                    href='/competitions/bcc'
                    className='block px-4 py-2.5 text-gray-600 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-lg transition-colors font-gemunu'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Business Case Competition
                  </Link>
                </div>
              )}
            </div>

            {/* Events Accordion */}
            <div>
              <button
                onClick={() => setIsMobileEventsOpen(!isMobileEventsOpen)}
                className='w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-xl transition-colors font-gemunu text-lg font-medium'
              >
                Events
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isMobileEventsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isMobileEventsOpen && (
                <div className='ml-4 space-y-1 mt-1'>
                  <Link
                    href='/event/yif-x-grand-seminar'
                    className='block px-4 py-2.5 text-gray-600 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-lg transition-colors font-gemunu'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    YIF & Grand Seminar
                  </Link>
                  <span className='block px-4 py-2.5 text-gray-400 cursor-not-allowed font-gemunu'>
                    Exhibition & Post Event
                  </span>
                </div>
              )}
            </div>

            <div className='border-t border-gray-200 my-4' />

            {status === 'loading' ? (
              <div className='px-4 py-3'>
                <div className='h-10 bg-gray-200 animate-pulse rounded-xl' />
              </div>
            ) : session?.user ? (
              <div className='space-y-1'>
                <div className='px-4 py-3'>
                  <p className='text-sm font-semibold text-gray-900 truncate'>
                    {session.user.name}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    @{session.user.username}
                  </p>
                </div>

                <Link
                  href='/profile'
                  className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-xl transition-colors font-gemunu text-lg'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className='w-5 h-5' />
                  My Profile
                </Link>

                <Link
                  href='/dashboard'
                  className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF6B7A] hover:bg-gray-50 rounded-xl transition-colors font-gemunu text-lg'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChevronDown className='w-5 h-5 -rotate-90' />
                  My Competition
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className='w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-gemunu text-lg'
                >
                  <LogOut className='w-5 h-5' />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href='/login'
                className='block mx-4 text-center py-3 bg-gradient-to-r from-[#8B2635] to-[#5A1623] text-white rounded-xl font-gemunu text-lg font-semibold transition-all'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
