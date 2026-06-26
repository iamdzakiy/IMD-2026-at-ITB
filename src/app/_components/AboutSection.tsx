export default function AboutSection() {
  return (
    <section className='py-12 md:py-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2
          className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-gemunu mb-8'
          data-aos='fade-up'
          style={{
            background: 'linear-gradient(90deg, #7B1919 0%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          What&apos;s The IMD 2026 at ITB?
        </h2>

        <div
          className='h-px bg-gradient-to-r from-transparent via-[#E8B4A8]/30 to-transparent mb-6 md:mb-8'
          data-aos='fade'
          data-aos-delay='100'
        />

        <p
          className='text-white/70 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-gemunu'
          data-aos='fade-up'
          data-aos-delay='200'
        >
          The IMD 2026 at ITB is a premier technology festival hosted annually
          by IMD 2026 at ITB ITB Student Branch. With a main theme of
          &ldquo;Shaping the Future of Industry with Smart Automation
          Technology&rdquo;, featuring a curated series of seminars and
          competitive challenges, the event empowers students to explore the
          frontiers of technology, innovation, and professional development.
        </p>
      </div>
    </section>
  );
}
