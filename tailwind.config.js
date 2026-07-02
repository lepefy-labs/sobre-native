/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          400: '#a8a29e',
          500: '#78716c',
          700: '#44403c',
          800: '#292524',
        },
        amber: {
          400: '#fbbf24',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
