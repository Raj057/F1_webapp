/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'f1': ['Formula1-Regular', 'sans-serif'],
        'f1-bold': ['Formula1-Bold', 'sans-serif'],
        'f1-wide': ['Formula1-Wide', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
