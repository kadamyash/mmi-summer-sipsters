/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo Bhaijaan 2"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'pop-in': 'pop-in 0.5s ease-out backwards',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
