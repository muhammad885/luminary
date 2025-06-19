/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        // No need for port if using default (443 for https)
        pathname: '/api/portraits/**', // Allows all paths under /api/portraits/
      },
    ],
  },
};

export default nextConfig;