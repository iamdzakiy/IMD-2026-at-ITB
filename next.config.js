/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ini akan mengabaikan warning ESLint saat build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Untuk avatar Google
      },
    ],
  },
};

module.exports = {
  // ... other config
  env: {
    NEXT_PUBLIC_DATOCMS_API_TOKEN:
      process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN || 'dummy-token',
  },
};
