/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'sb-blue': '#4A90E2',
        'sb-yellow': '#F5D547',
        'sb-pink': '#F4A2A2',
        'sb-teal': '#1A4D4D',
        'sb-bg': '#E8F4F8',
        'sb-dark-bg': '#0F172A',
        'sb-dark-card': '#1E293B',
        'sb-dark-border': '#334155',
        'sb-dark-text': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};