/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Only handle CSS if you have custom requirements
    config.module.rules.push({
      test: /\.css$/i,
      use: [
        isServer ? require.resolve('style-loader') : 'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        'postcss-loader'
      ],
    });
    return config;
  },
};

module.exports = nextConfig;