/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-blue': '#0B0F1A',
        'cosmic-purple': '#191326',
        'electric-cyan': '#00FFFF',
        'light-cyan': '#79F7F7',
        'magenta': '#FF00FF',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'energy-gradient': 'linear-gradient(90deg, #00FFFF, #FF00FF)',
      },
      animation: {
        'cosmic-bg': 'cosmic-bg 25s ease infinite',
        'aurora': 'aurora 15s ease infinite',
        'pulse-glow': 'pulse-glow 3s infinite',
        'gradient-flow': 'gradient-flow 4s linear infinite',
      },
      keyframes: {
        'cosmic-bg': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aurora': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px #00FFFF' },
          '50%': { boxShadow: '0 0 35px #FF00FF' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
    },
  },
  plugins: [],
};
