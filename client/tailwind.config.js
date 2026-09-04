/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        gold: {
          50: '#fbf7ee',
          100: '#f3e7cc',
          300: '#e0b44a',
          400: '#d4a017',
          500: '#c9a227',
          600: '#a6851c',
          700: '#7c6414',
        },
      },
      boxShadow: {
        card: '0 12px 40px -16px rgba(0,0,0,.45)',
        glow: '0 0 40px -8px rgba(201,162,39,.35)',
      },
      backgroundImage: {
        'hero-fade': 'linear-gradient(180deg, rgba(9,9,11,.15) 0%, rgba(9,9,11,.72) 55%, var(--ah-bg) 100%)',
      },
    },
  },
  plugins: [],
};
