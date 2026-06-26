'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChevronRight,
  ChevronDown,
  Trophy,
  Calendar,
  FileText,
  CheckCircle2,
} from 'lucide-react';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import { getCompetitionContent, formatDate } from '@/lib/competition-content';

interface TimelineEvent {
  id: string;
  phase: string;
  label: string;
  description: string | null;
  startDate: string;
  endDate: string;
  sortOrder: number;
  phaseType: string;
}

interface CompetitionData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  registrationOpen: string;
  registrationDeadline: string;
  preliminaryStart: string;
  preliminaryDeadline: string;
  semifinalStart: string;
  semifinalDeadline: string;
  finalStart: string | null;
  finalDeadline: string | null;
  grandFinalDate: string | null;
  registrationFee: number;
  minTeamSize: number;
  maxTeamSize: number;
  isActive: boolean;
  timelineEvents: TimelineEvent[];
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const code = (params.code as string).toUpperCase();
  const content = getCompetitionContent(code);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  // Fetch competition data from DB (includes timeline events and deadlines)
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const res = await fetch(`/api/competitions/${code.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          setCompetition(data.competition || data);
        }
      } catch {
        // Fallback to content-only mode
      } finally {
        setLoading(false);
      }
    }
    fetchCompetition();
  }, [code]);

  // Countdown to registration deadline (from DB)
  // Use stable string values for deps to prevent infinite re-render loops
  const deadlineStr =
    competition?.registrationDeadline || '2026-03-16T16:59:59Z';
  const regOpenStr = competition?.registrationOpen || '2026-02-20T17:00:00Z';

  const { isRegOpen, isRegUpcoming } = useMemo(() => {
    const now = new Date();
    const dl = new Date(deadlineStr);
    const ro = new Date(regOpenStr);
    return {
      isRegOpen: now >= ro && now <= dl,
      isRegUpcoming: now < ro,
    };
  }, [deadlineStr, regOpenStr]);

  useEffect(() => {
    const deadline = new Date(deadlineStr);
    const registrationOpen = new Date(regOpenStr);
    const target = isRegUpcoming ? registrationOpen : deadline;

    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [deadlineStr, regOpenStr, isRegUpcoming]);

  if (!content) {
    return (
      <div className='min-h-screen bg-[#0B0102] flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-white mb-4'>
            Competition Not Found
          </h1>
          <Link href='/' className='text-[#FFCD8D] hover:underline'>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Determine countdown label
  const countdownLabel = isRegUpcoming
    ? 'Registration Opens In'
    : isRegOpen
      ? 'Extended Registration Closes In'
      : 'Registration Closed';

  // Use DB timeline events if available, otherwise empty
  const timelineEvents: TimelineEvent[] = competition?.timelineEvents || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] font-['Gemunu_Libre']">
      <Navbar />

      <main>
        {/* Hero Section with Countdown */}
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden pt-20'>
          {/* Background Blobs */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            <Image
              src='/hero/hero-circle-1.svg'
              alt=''
              width={800}
              height={800}
              className='absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 opacity-70'
            />
            <Image
              src='/hero/hero-circle-2.svg'
              alt=''
              width={800}
              height={800}
              className='absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 opacity-70'
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
              {/* Competition Name */}
              <div className='text-center mb-6 sm:mb-8'>
                {/* Extended Registration Badge */}
                {isRegOpen && (
                  <div className='mb-4 sm:mb-6'>
                    <span className='inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 backdrop-blur-sm'>
                      <span className='relative flex h-2.5 w-2.5'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75' />
                        <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400' />
                      </span>
                      <span className='text-amber-200 font-bold text-sm sm:text-base tracking-wide'>
                        Extended Registration — Until March 16
                      </span>
                    </span>
                  </div>
                )}
                <h1 className='text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-3 sm:mb-4 tracking-wide'>
                  {content.name}
                </h1>
                <p className='text-xl md:text-2xl text-gray-300'>
                  {content.tagline}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className='text-center mb-8 sm:mb-12'>
                <p className='text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg'>
                  {countdownLabel}
                </p>
                <div className='flex justify-center gap-3 sm:gap-4 md:gap-8'>
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className='backdrop-blur-md bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 min-w-[80px] sm:min-w-[100px] md:min-w-[140px]'
                    >
                      <div className='text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-1 sm:mb-2'>
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className='text-xs sm:text-sm md:text-base text-gray-400 uppercase tracking-wider'>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className='text-center'>
                {status === 'loading' || loading ? (
                  <div className='inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 rounded-full text-white font-bold text-xl opacity-50'>
                    Loading...
                  </div>
                ) : !isRegOpen ? (
                  <div className='inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-500 rounded-full text-white/70 font-bold text-base sm:text-xl cursor-not-allowed text-center'>
                    {isRegUpcoming
                      ? 'Registration Not Yet Open'
                      : 'Registration Closed'}
                  </div>
                ) : session ? (
                  <Link
                    href={`/competitions/${code.toLowerCase()}/register`}
                    className='inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#FFCD8D] via-[#E8A05D] to-[#FFCD8D] rounded-full text-[#0B0102] font-bold text-base sm:text-xl hover:scale-105 transition-transform duration-300 shadow-xl shadow-orange-500/30'
                  >
                    Register Now
                    <ChevronRight size={20} className='sm:w-6 sm:h-6' />
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      router.push(
                        '/login?callbackUrl=' +
                          encodeURIComponent(
                            `/competitions/${code.toLowerCase()}/register`,
                          ),
                      )
                    }
                    className='inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#FFCD8D] via-[#E8A05D] to-[#FFCD8D] rounded-full text-[#0B0102] font-bold text-base sm:text-xl hover:scale-105 transition-transform duration-300 shadow-xl shadow-orange-500/30'
                  >
                    Login to Register
                    <ChevronRight size={20} className='sm:w-6 sm:h-6' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About Competition */}
        <section className='py-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-4xl md:text-5xl font-bold text-white text-center mb-12'>
              About The Competition
            </h2>
            <div className='backdrop-blur-xl bg-white/[0.08] rounded-3xl border border-white/10 p-8 md:p-12'>
              <p className='text-lg md:text-xl text-gray-300 leading-relaxed text-center'>
                {content.description}
              </p>
            </div>
          </div>
        </section>

        {/* Prize Pool */}
        <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#190204]/50 to-transparent'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center'>
              <Trophy className='inline-block text-[#FFCD8D] mb-4' size={48} />
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-8'>
                Prize Pool
              </h2>

              {/* Single Total Prize Badge */}
              <div className='inline-block backdrop-blur-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 rounded-3xl border-2 border-[#FFD700]/30 px-6 sm:px-12 py-8 sm:py-10 max-w-full'>
                <div className='text-4xl sm:text-6xl mb-3 sm:mb-4'>🏆</div>
                <p className='text-3xl sm:text-5xl md:text-6xl font-bold text-[#FFD700] break-words'>
                  {content.prizePool.total}
                </p>
                <p className='py-6 text-lg sm:text-[16px] text-gray-300 mb-2'>
                  *Total Prize Pool for All The IMD 2026 at ITB 3.0 Competitions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className='py-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-12'>
              <Calendar
                className='inline-block text-[#FFCD8D] mb-4'
                size={48}
              />
              <h2 className='text-4xl md:text-5xl font-bold text-white'>
                {content.name}&apos;s Timeline
              </h2>
            </div>

            {timelineEvents.length > 0 ? (
              <div className='relative'>
                {/* Center vertical line — desktop only */}
                <div className='hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FFCD8D]/60 via-[#FFCD8D]/30 to-transparent -translate-x-1/2' />

                {/* Mobile left line */}
                <div className='md:hidden absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#FFCD8D]/60 via-[#FFCD8D]/30 to-transparent' />

                <div className='space-y-8 md:space-y-12'>
                  {timelineEvents
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((event, index) => {
                      const isLeft = index % 2 === 0;
                      const now = new Date();
                      const eventStart = new Date(event.startDate);
                      const eventEnd = new Date(event.endDate);
                      const isPast = now > eventEnd;
                      const isActive = now >= eventStart && now <= eventEnd;
                      const isUpcoming = now < eventStart;

                      // Dot color based on phase status (active/past/upcoming)
                      const dotColor = isPast
                        ? 'bg-gray-500 shadow-gray-500/20'
                        : isActive
                          ? 'bg-[#FFCD8D] shadow-[#FFCD8D]/60 animate-pulse'
                          : event.phaseType === 'registration'
                            ? 'bg-green-400 shadow-green-400/40'
                            : event.phaseType === 'submission'
                              ? 'bg-blue-400 shadow-blue-400/40'
                              : event.phaseType === 'announcement'
                                ? 'bg-yellow-400 shadow-yellow-400/40'
                                : 'bg-purple-400 shadow-purple-400/40';

                      // Card styling based on phase status
                      const cardBg = isPast
                        ? 'bg-white/[0.04] border-white/5 opacity-60'
                        : isActive
                          ? 'bg-[#FFCD8D]/10 border-[#FFCD8D]/30 ring-1 ring-[#FFCD8D]/20'
                          : 'bg-white/[0.08] border-white/10 hover:bg-white/[0.12]';

                      const titleColor = isPast
                        ? 'text-gray-500'
                        : isActive
                          ? 'text-[#FFCD8D]'
                          : 'text-[#FFCD8D]';

                      const dateColor = isPast
                        ? 'text-gray-600'
                        : isActive
                          ? 'text-[#FFCD8D]/70'
                          : 'text-gray-400';

                      // Status badge
                      const statusBadge = isPast
                        ? {
                            label: 'Completed',
                            className:
                              'bg-gray-500/20 text-gray-400 border-gray-500/30',
                          }
                        : isActive
                          ? {
                              label: 'Active',
                              className:
                                'bg-[#FFCD8D]/20 text-[#FFCD8D] border-[#FFCD8D]/30',
                            }
                          : null;

                      return (
                        <div
                          key={event.id}
                          className='relative flex items-start md:items-center'
                        >
                          {/* ── Mobile layout (left-aligned) ── */}
                          <div className='md:hidden flex items-start w-full'>
                            {/* Dot on line */}
                            <div className='absolute left-4 top-6 -translate-x-1/2 z-10'>
                              <div
                                className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_8px]`}
                              />
                            </div>
                            {/* Card */}
                            <div
                              className={`ml-10 flex-1 backdrop-blur-xl rounded-2xl border p-5 transition-all duration-300 ${cardBg}`}
                            >
                              <div className='flex items-center gap-2 mb-1'>
                                <h3
                                  className={`text-lg font-bold ${titleColor}`}
                                >
                                  {event.label}
                                </h3>
                                {statusBadge && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.className}`}
                                  >
                                    {statusBadge.label}
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <p className='text-gray-300 text-sm mb-2'>
                                  {event.description}
                                </p>
                              )}
                              <div className={`text-xs ${dateColor}`}>
                                {formatDate(event.startDate)} WIB
                                {event.startDate !== event.endDate &&
                                  ` — ${formatDate(event.endDate)} WIB`}
                              </div>
                            </div>
                          </div>

                          {/* ── Desktop layout (alternating left/right) ── */}
                          <div className='hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6 w-full items-center'>
                            {/* Left column */}
                            <div
                              className={
                                isLeft ? 'text-right' : 'order-3 text-left'
                              }
                            >
                              <div
                                className={`backdrop-blur-xl rounded-2xl border p-6 transition-all duration-300 inline-block max-w-md ${isLeft ? 'ml-auto' : 'mr-auto'} ${cardBg}`}
                              >
                                <div
                                  className={`flex items-center gap-2 mb-1 ${isLeft ? 'justify-end' : 'justify-start'}`}
                                >
                                  {isLeft && statusBadge && (
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.className}`}
                                    >
                                      {statusBadge.label}
                                    </span>
                                  )}
                                  <h3
                                    className={`text-xl font-bold ${titleColor}`}
                                  >
                                    {event.label}
                                  </h3>
                                  {!isLeft && statusBadge && (
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.className}`}
                                    >
                                      {statusBadge.label}
                                    </span>
                                  )}
                                </div>
                                {event.description && (
                                  <p className='text-gray-300 text-sm mb-2'>
                                    {event.description}
                                  </p>
                                )}
                                <div className={`text-sm ${dateColor}`}>
                                  {formatDate(event.startDate)} WIB
                                  {event.startDate !== event.endDate &&
                                    ` — ${formatDate(event.endDate)} WIB`}
                                </div>
                              </div>
                            </div>

                            {/* Center dot */}
                            <div className='flex items-center justify-center order-2'>
                              <div
                                className={`w-4 h-4 rounded-full ${dotColor} shadow-[0_0_12px] ring-4 ring-[#0B0102]`}
                              />
                            </div>

                            {/* Right column (empty when card is on left, and vice-versa) */}
                            <div className={isLeft ? 'order-3' : 'order-1'} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-500 py-8'>
                Timeline coming soon...
              </div>
            )}
          </div>
        </section>

        {/* FAQs */}
        <section className='py-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-5xl mx-auto'>
            {/* Title with QnA Icons */}
            <div className='flex items-center justify-center gap-4 md:gap-8 mb-12 md:mb-16'>
              <Image
                src='/qna.svg'
                alt='QnA'
                width={128}
                height={128}
                className='hidden lg:block w-24 h-24 lg:w-32 lg:h-32 shrink-0'
              />
              <h2
                className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center font-gemunu'
                style={{
                  background:
                    'linear-gradient(90deg, #7B1919 0%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Any Questions?
              </h2>
              <Image
                src='/qna-2.svg'
                alt='QnA'
                width={192}
                height={192}
                className='hidden lg:block w-36 h-36 lg:w-48 lg:h-48 -ml-12 lg:-ml-16 shrink-0'
              />
            </div>

            {/* 2-Column FAQ Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
              {content.faqs.map((faq, index) => (
                <details
                  key={index}
                  className='bg-gradient-to-br from-[#2a0507]/50 to-[#1a0304]/50 rounded-2xl md:rounded-[24px] border border-white/10 overflow-hidden group'
                >
                  <summary className='w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left cursor-pointer list-none hover:bg-white/5 transition-colors'>
                    <span className='text-white font-semibold text-sm sm:text-base'>
                      {faq.question}
                    </span>
                    <ChevronDown className='h-5 w-5 text-white/70 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='px-4 md:px-6 pb-3 md:pb-4 text-white/70 text-xs sm:text-sm leading-relaxed'>
                    {faq.answer || 'To be announced.'}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
