/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployments
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            url: false,
            importLoaders: 1,
            modules: false,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: true,
            },
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;