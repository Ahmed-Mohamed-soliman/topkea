/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E50914',
          'red-dark': '#B0060F',
          'red-light': '#FF1A26',
          black: '#000000',
          'gray-900': '#0A0A0A',
          'gray-800': '#141414',
          'gray-700': '#1F1F1F',
          'gray-600': '#2A2A2A',
          'gray-400': '#666666',
          'gray-200': '#CCCCCC',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        arabic: ['Noto Kufi Arabic', 'Cairo', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-red': 'pulseRed 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseRed: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(229,9,20,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(229,9,20,0)' } },
      },
    },
  },
  plugins: [],
};
