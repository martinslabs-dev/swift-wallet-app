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
        'pulse-glow': 'pulse-glow 3s infinite',
        'fade-in-out': 'fade-in-out 5s ease-in-out infinite',
        'fly-in': 'fly-in 1.5s ease-out forwards',
      },
      keyframes: {
        'cosmic-bg': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px #00FFFF', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 35px #FF00FF', transform: 'scale(1.05)' },
        },
        'fade-in-out': {
            '0%, 100%': { opacity: 0, transform: 'translateY(10px)' },
            '20%, 80%': { opacity: 1, transform: 'translateY(0px)' },
        },
        'fly-in': {
            '0%': { transform: 'translateY(-50px) scale(0.8)', opacity: 0 },
            '100%': { transform: 'translateY(0) scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
