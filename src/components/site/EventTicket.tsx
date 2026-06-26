'use client';

import { CheckCircle, Download } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface EventTicketProps {
  eventName: string;
  eventDate: string;
  attendeeName: string;
  attendeeEmail: string;
  institution: string;
  venue?: string;
  openGate?: string;
  zoomLink?: string;
  fee?: string;
}

export default function EventTicket({
  eventName,
  eventDate,
  attendeeName,
  attendeeEmail,
  institution,
  venue = 'Seminar Auditorium Lantai 8, Gedung PAU @ Institut Teknologi Bandung',
  openGate = '12.00 WIB',
  zoomLink = 'https://ui-ac-id.zoom.us/j/98559432483?pwd=RFuTp23fwYtdbSPKFG2zva4CYpBi3q.1',
  fee = 'FREE',
}: EventTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;

      // Hide notch cutouts for clean capture by temporarily adjusting them
      const ticket = ticketRef.current;
      const canvas = await html2canvas(ticket, {
        backgroundColor: '#0B0102',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `ticket-${eventName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download ticket:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [eventName, isDownloading]);

  return (
    <div>
      {/* Ticket Card — capturable area */}
      <div ref={ticketRef} className='relative' style={{ padding: '12px 0' }}>
        {/* Top notch cutouts */}
        <div className='absolute top-0 left-8 w-6 h-6 bg-[#0B0102] rounded-full z-10' />
        <div className='absolute top-0 right-8 w-6 h-6 bg-[#0B0102] rounded-full z-10' />

        <div className='relative bg-gradient-to-br from-[#1a0a0a] via-[#1e0f0f] to-[#1a0808] rounded-3xl overflow-hidden border border-[#FFCD8D]/20 shadow-2xl shadow-orange-900/20'>
          {/* Gold accent bar */}
          <div className='h-1.5 bg-gradient-to-r from-transparent via-[#FFCD8D] to-transparent' />

          {/* Header */}
          <div className='px-6 sm:px-8 pt-8 pb-4 text-center'>
            <p className='text-[#FFCD8D]/60 text-xs font-semibold tracking-[0.3em] uppercase mb-2'>
              The IMD 2026 at ITB 3.0 — IMD 2026 at ITB
            </p>
            <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
              {eventName}
            </h2>
            <p className='text-gray-400 text-sm mt-1'>{eventDate}</p>
          </div>

          {/* Confirmed badge */}
          <div className='flex justify-center pb-4'>
            <div className='inline-flex items-center gap-2 px-5 py-2 bg-green-500/10 border border-green-500/30 rounded-full'>
              <CheckCircle className='w-4 h-4 text-green-400' />
              <span className='text-green-400 text-sm font-semibold tracking-wide'>
                CONFIRMED
              </span>
            </div>
          </div>

          {/* Perforated divider */}
          <div className='relative flex items-center my-2'>
            <div className='absolute -left-4 w-8 h-8 bg-gradient-to-r from-[#0B0102] to-[#190204] rounded-full' />
            <div className='flex-1 mx-6 border-t-2 border-dashed border-[#FFCD8D]/15' />
            <div className='absolute -right-4 w-8 h-8 bg-gradient-to-l from-[#0B0102] to-[#190204] rounded-full' />
          </div>

          {/* Attendee info */}
          <div className='px-6 sm:px-8 py-5 space-y-4'>
            <div>
              <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                Attendee
              </p>
              <p className='text-white text-lg font-bold mt-0.5'>
                {attendeeName}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                  Email
                </p>
                <p className='text-gray-300 text-sm mt-0.5 break-all'>
                  {attendeeEmail}
                </p>
              </div>
              <div>
                <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                  Institution
                </p>
                <p className='text-gray-300 text-sm mt-0.5'>{institution}</p>
              </div>
            </div>
          </div>

          {/* Perforated divider */}
          <div className='relative flex items-center my-2'>
            <div className='absolute -left-4 w-8 h-8 bg-gradient-to-r from-[#0B0102] to-[#190204] rounded-full' />
            <div className='flex-1 mx-6 border-t-2 border-dashed border-[#FFCD8D]/15' />
            <div className='absolute -right-4 w-8 h-8 bg-gradient-to-l from-[#0B0102] to-[#190204] rounded-full' />
          </div>

          {/* Event details */}
          <div className='px-6 sm:px-8 py-5 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                  Venue
                </p>
                <p className='text-gray-300 text-sm mt-0.5 leading-relaxed'>
                  {venue}
                </p>
              </div>
              <div>
                <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                  Open Gate
                </p>
                <p className='text-white text-xl font-bold mt-0.5'>
                  {openGate}
                </p>
              </div>
            </div>

            <div>
              <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                Zoom Link
              </p>
              <a
                href={zoomLink}
                target='_blank'
                rel='noopener noreferrer'
                className='text-[#FFCD8D] text-sm mt-0.5 underline underline-offset-2 break-all hover:text-[#FFE4B5] transition-colors'
              >
                Join via Zoom
              </a>
            </div>

            <div>
              <p className='text-[#FFCD8D]/50 text-[10px] font-semibold tracking-[0.2em] uppercase'>
                Registration Fee
              </p>
              <p className='text-green-400 text-sm font-semibold mt-0.5'>
                {fee}
              </p>
            </div>
          </div>

          {/* Decorative footer with barcode-style element */}
          <div className='px-6 sm:px-8 pb-6 pt-2'>
            <div className='flex justify-center gap-[3px]'>
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-[#FFCD8D]/20 rounded-sm'
                  style={{
                    width: i % 3 === 0 ? '3px' : '2px',
                    height: `${20 + (i % 5) * 4}px`,
                  }}
                />
              ))}
            </div>
            <p className='text-center text-[#FFCD8D]/30 text-[10px] mt-2 tracking-widest font-mono'>
              IMD 2026 at ITB-3.0-YIF-GS
            </p>
          </div>

          {/* Gold accent bar bottom */}
          <div className='h-1.5 bg-gradient-to-r from-transparent via-[#FFCD8D] to-transparent' />
        </div>

        {/* Bottom notch cutouts */}
        <div className='absolute bottom-0 left-8 w-6 h-6 bg-[#0B0102] rounded-full z-10' />
        <div className='absolute bottom-0 right-8 w-6 h-6 bg-[#0B0102] rounded-full z-10' />
      </div>

      {/* Download Button */}
      <div className='flex justify-center mt-6'>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className='inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#FFCD8D]/20 to-[#FFE4B5]/10 border-2 border-[#FFCD8D]/30 rounded-2xl text-[#FFCD8D] font-bold hover:from-[#FFCD8D]/30 hover:to-[#FFE4B5]/20 hover:border-[#FFCD8D]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isDownloading ? (
            <>
              <div className='w-5 h-5 border-2 border-[#FFCD8D]/30 border-t-[#FFCD8D] rounded-full animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <Download className='w-5 h-5' />
              Download Ticket
            </>
          )}
        </button>
      </div>
    </div>
  );
}
