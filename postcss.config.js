module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    }),
    require('postcss-nested')(),
    require('tailwindcss')(),
    require('autoprefixer')(),
    ...(process.env.NODE_ENV === 'production'
      ? [require('cssnano')({ preset: 'default' })]
      : [])
  ]
}