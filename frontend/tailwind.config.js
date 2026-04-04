/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        earth: '#2D4A3E',
        moss: '#4A7C59',
        leaf: '#7DB87A',
        lime: '#B8E06A',
        cream: '#F5F0E8',
        amber: '#E8C547',
        rust: '#C45C3A',
        sky: '#5B8FA8',
        mist: '#D4E8D4',
        charcoal: '#1A2B24',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}