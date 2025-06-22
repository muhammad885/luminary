module.exports = {
  plugins: {
    'postcss-import': {},  // Handles @import rules
    'postcss-nested': {},  // Processes nested CSS
    'tailwindcss': {},     // Tailwind CSS
    'autoprefixer': {},    // Vendor prefixes
    ...(process.env.NODE_ENV === 'production' ? { 'cssnano': {} } : {})  // Minification
  }
}