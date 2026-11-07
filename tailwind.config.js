/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f4f9', 100: '#e0e6f0', 200: '#c2cde1', 300: '#94a6c7', 400: '#6580ad',
          500: '#456394', 600: '#344d79', 700: '#2b3f63', 800: '#1e2d4a', 900: '#14203a', 950: '#0b1426',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
