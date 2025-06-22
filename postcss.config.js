module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {}, // Add this line
    'tailwindcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? { 'cssnano': {} } : {})
  }
}