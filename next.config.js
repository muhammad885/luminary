/** @type {import('next').NextConfig} */
module.exports = {
  // Let Next.js handle CSS by default
  experimental: {
    appDir: true,
  },
  
  // Only add if you have specific needs
  webpack: (config) => {
    // Your custom webpack config here if needed
    return config
  }
}