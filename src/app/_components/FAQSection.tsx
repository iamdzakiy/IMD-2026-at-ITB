'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is The IMD 2026 at ITB?',
      answer:
        'The IMD 2026 at ITB is an annual national-level competition event organized by IMD 2026 at ITB Student Branch, featuring three competitions: ProtoTech Competition (PTC), Technovate Paper Competition (TPC), and Business Case Competition (BCC).',
    },
    {
      question: 'Who can participate?',
      answer:
        'Active undergraduate (S1/D4) students from accredited Indonesian universities. PTC and TPC also accept high school/equivalent (SMA/SMK/MA) students.',
    },
    {
      question: 'Can I register for multiple competitions?',
      answer:
        'Each account can only register for one competition. However, team members (non-leaders) may appear in teams for different competitions.',
    },
    {
      question: 'What is the registration fee?',
      answer:
        'Early Registration — PTC: Rp 200,000, BCC: Rp 150,000, TPC: Rp 125,000 per team. Normal Registration — PTC: Rp 220,000, BCC: Rp 180,000, TPC: Rp 150,000 per team.',
    },
    {
      question: 'What is the total prize pool?',
      answer:
        'The total prize pool across all competitions is Rp 25.000.000++, including cash prizes, certificates, and other rewards.',
    },
    {
      question: 'When is the Grand Final?',
      answer:
        'The Grand Final and Awarding ceremony for all competitions will be held on April 25, 2026.',
    },
  ];

  return (
    <section className='py-12 md:py-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div
          className='flex items-center justify-center gap-4 md:gap-8 mb-12 md:mb-16'
          data-aos='fade-up'
        >
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
              background: 'linear-gradient(90deg, #7B1919 0%, #FFFFFF 100%)',
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

        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='bg-gradient-to-br from-[#2a0507]/50 to-[#1a0304]/50 rounded-2xl md:rounded-[24px] border border-white/10 overflow-hidden'
                data-aos='fade-up'
                data-aos-delay={index * 100}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className='w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors'
                >
                  <span className='text-white font-gemunu font-semibold text-sm sm:text-base'>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-white/70 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className='px-4 md:px-6 pb-3 md:pb-4 text-white/70 font-gemunu text-xs sm:text-sm'>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
