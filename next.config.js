/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // For localhost development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // For production domains - using static value instead of env variable
      {
        protocol: 'https',
        hostname: 'your-production-domain.com', // Replace with your actual domain
      }
    ],
  },
  
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  
  reactStrictMode: true,
  
  trailingSlash: true,
  
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/auth/login': { page: '/auth/login' },
      '/auth/new-password': { page: '/auth/new-password' },
    };
  }
};

module.exports = nextConfig;