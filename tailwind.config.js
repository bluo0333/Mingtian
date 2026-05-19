/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode
        jade: {
          50: '#eef6f3',
          100: '#d4ebe4',
          200: '#a9d7c9',
          300: '#7ec3ae',
          400: '#53af93',
          500: '#4a7c6f', // primary
          600: '#3a6357',
          700: '#2a4a3f',
          800: '#1a3127',
          900: '#0a1810',
        },
        cream: '#faf6ef',
        // Dark mode
        dark: {
          50: '#f0e4b8',
          100: '#eddfa0',
          200: '#e4d280',
          300: '#dbc560',
          400: '#d2b840',
          500: '#b8962a', // gold
          600: '#9b7b22',
          700: '#7e601a',
          800: '#614512',
          900: '#442a0a',
        },
        charcoal: {
          50: '#f5f5f0',
          100: '#e8e8e0',
          200: '#d1d1c1',
          300: '#babba2',
          400: '#a3a483',
          500: '#8c8d64',
          600: '#6b6b4d',
          700: '#4a4936',
          800: '#29271f',
          900: '#181810', // primary dark
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}