import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── New Typography Scale ───
      fontSize: {
        heading: ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 56px
        subheading: ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }], // 36px
        stinger: ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }], // 24px
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
        // Keep existing fonts if needed, but set Helvetica as default
      },
      // ─── New Color Palette ───
      colors: {
        'imd-blue': '#4b6eff',
        'imd-cyan': '#00d4ff',
        'imd-mint': '#7cffcb',
        'imd-purple': '#ab7cff',
        // Keep existing colors if you still need them
      },
    },
  },
  plugins: [],
};

export default config;
