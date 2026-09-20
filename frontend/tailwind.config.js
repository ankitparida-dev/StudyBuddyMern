/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'sb-blue': '#4A90E2',
        'sb-yellow': '#F5D547',
        'sb-pink': '#F4A2A2',
        'sb-teal': '#1A4D4D',
        'sb-bg': '#E8F4F8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};