/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dmart: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#148846', // Primary DMart Green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          dark: '#0b3d1f'
        }
      }
    },
  },
  plugins: [],
}
