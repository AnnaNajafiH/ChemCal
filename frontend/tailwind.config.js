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
        'drip': 'drip 2s ease-in-out infinite',
      },
      keyframes: {
        drip: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
