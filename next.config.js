/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
    ],
    unoptimized: true, // Disable next/image optimization (needed for Netlify compatibility)
  },
};

module.exports = nextConfig;
