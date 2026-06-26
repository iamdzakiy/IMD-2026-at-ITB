/**
 * ============================================================================
 * EVENT CONTENT - Static display content for each event
 * ============================================================================
 *
 * Contains descriptions, FAQs, speakers, and links for the
 * YIF x Grand Seminar page. This is an informational page (no registration flow).
 * ============================================================================
 */

export interface Speaker {
  name: string;
  title: string;
  organization: string;
  description: string;
  imageUrl?: string;
  highlights?: string[];
}

export interface LinkTreeItem {
  label: string;
  url: string;
  description?: string;
}

export interface EventContent {
  code: string;
  name: string;
  tagline: string;
  description: string;
  date: string; // Display date string
  dateISO: string; // ISO date for countdown
  venue: string;
  speakers?: Speaker[];
  links: LinkTreeItem[];
}

export const EVENT_CONTENT: Record<string, EventContent> = {
  'yif-x-grand-seminar': {
    code: 'yif-x-grand-seminar',
    name: 'YIF x Grand Seminar',
    tagline: 'Inspiring Minds, Shaping The Future',
    description:
      'YIF x Grand Seminar is a flagship event of The IMD 2026 at ITB 3.0 that combines a world-class seminar with a global youth discussion platform. Featuring expert insights alongside youth perspectives, this event explores Smart Automation Technology and its impact on industry and society. It focuses on industry perspectives on automation and smart systems, youth innovation, future skills, and technology-driven problem solving — bridging discussion-based learning with real innovation showcased in the Exhibition.',
    date: 'March 7, 2026',
    dateISO: '2026-03-07T09:00:00+07:00',
    venue:
      'Seminar Auditorium Lantai 8, Gedung PAU @ Institut Teknologi Bandung',
    speakers: [
      {
        name: 'Amanda Ayu Lestari',
        title:
          'Sales Manager – Drive Products, Motion | PT. ABB Sakti Industri',
        organization: 'PT. ABB Sakti Industri',
        description:
          'Amanda Ayu Lestari is a sales and channel management professional with over seven years of experience in industrial technology. She leads Drive Products business growth at ABB Indonesia, focusing on partner performance, solution selling, and Variable Speed Drives adoption across key industries.',
        imageUrl: '/speakers/speaker-amanda-lestari.jpeg',
        highlights: [
          '7+ years in industrial technology sector',
          'Leads channel development & strategic partnerships',
          'Specialist in Variable Speed Drives solutions',
          'Strong expertise in water & wastewater industry segment',
        ],
      },
      {
        name: 'Edward Hartanto Enrico Abadi',
        title:
          'Product & Marketing (Community), Garena | Content Creator (150K+ Followers)',
        organization: 'Garena / Content Creator',
        description:
          'Edward Hartanto Enrico Abadi is a product and marketing professional with a strong background in business, UX, and community growth. Currently at Garena, he drives revenue optimization and user engagement initiatives, while also building a 150K+ audience as an education and career content creator.',
        imageUrl: '/speakers/speaker-edward-enrico.jpg',
        highlights: [
          'Increased ARPPU by 10% and boosted user revival rate by 20% at Garena',
          'Former PMO at SeaBank, contributing to 10% conversion growth',
          '55+ national & international awards (GEMASTIK, LLDIKTI, BINUS Outstanding Student)',
          'IISMA Awardee – Exchange at Universiti Sains Malaysia',
          '7M+ social media likes; 100K+ users benefited from free CV template',
        ],
      },
    ],
    links: [
      {
        label: 'Register Now',
        url: '/event/yif-x-grand-seminar/register',
      },
      {
        label: 'SOP & ToR',
        url: 'https://drive.google.com/drive/folders/1E5IPVl_ux2EjMLzmI2fuSHuWICGYAaiN',
      },
    ],
  },
};

// Helper function to get event content
export function getEventContent(code: string): EventContent | null {
  const lowerCode = code.toLowerCase();
  return EVENT_CONTENT[lowerCode] || null;
}

// Get all event codes
export function getAllEventCodes(): string[] {
  return Object.keys(EVENT_CONTENT);
}
