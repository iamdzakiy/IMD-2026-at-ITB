import Image from 'next/image';

export default function StatsSection() {
  const stats = [
    {
      value: '4.9/5',
      label: 'The IMD 2026 at ITB 2.0 Feedback',
      mascot: '/mascots/mascot-3.svg',
    },
    {
      value: 'Rp 25.000.000++',
      label: 'Total Prize Pool for All The IMD 2026 at ITB 3.0 Competitions',
      mascot: '/mascots/mascot-4.svg',
    },
    {
      value: '300+',
      label: 'Teams involved in The IMD 2026 at ITB 2.0',
      mascot: '/mascots/mascot-5.svg',
    },
  ];

  return (
    <section className='py-12 md:py-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='text-center'
              data-aos='fade-up'
              data-aos-delay={index * 150}
            >
              <div className='flex justify-center mb-4 md:mb-6'>
                <Image
                  src={stat.mascot}
                  alt={stat.label}
                  width={80}
                  height={80}
                  className='opacity-90 w-16 h-16 sm:w-20 sm:h-20'
                />
              </div>
              <div
                className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-gemunu mb-3'
                style={{
                  background:
                    'linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 15px rgba(255, 205, 141, 0.4))',
                }}
              >
                {stat.value}
              </div>
              <div className='text-white/70 font-gemunu text-sm sm:text-base md:text-lg'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
