/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.css",   // i added that in case 
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 15s linear infinite',
      }
    },
  },
  plugins: [],
}
