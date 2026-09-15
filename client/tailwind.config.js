/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Arial Narrow', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#f7f3e8',
          100: '#ebe0c0',
          300: '#d4b45a',
          400: '#c9a227',
          500: '#b8921f',
          600: '#947618',
          700: '#6e5712',
        },
      },
      boxShadow: {
        card: '0 18px 50px -28px rgba(0,0,0,.55)',
        glow: '0 0 48px -10px rgba(184,146,31,.4)',
      },
      keyframes: {
        heroDrift: {
          '0%': { transform: 'scale(1.08) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.16) translate3d(-1.5%, 1%, 0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        heroDrift: 'heroDrift 22s ease-in-out alternate infinite',
        riseIn: 'riseIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
