/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: '#e9f4f1',
          100: '#d3e8e4',
          200: '#b4d8d2',
          300: '#8fc4bc',
          400: '#65aca1',
          500: '#3d9187',
          600: '#2a7d73',
          700: '#1f6b63',
          800: '#163530',
          900: '#0f2e2a',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f7f4ee',
          200: '#eee8de',
        },
        success: '#5C9B73',
        dark: {
          50: '#f5ecd8',
          100: '#eddcae',
          200: '#e4c97f',
          300: '#d4a95a',
          400: '#c79445',
          500: '#b38037',
          600: '#93672b',
          700: '#734f1f',
          800: '#533713',
          900: '#382308',
        },
        charcoal: {
          50: '#ecefeb',
          100: '#d8ded8',
          200: '#b7c1b9',
          300: '#92a096',
          400: '#728178',
          500: '#55645c',
          600: '#3b4742',
          700: '#2a332f',
          800: '#1c2420',
          900: '#121815',
        },
        ink: {
          900: '#163530',
          700: '#687771',
        },
        gold: '#D4A95A',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(31,107,99,0.08), 0 1px 3px rgba(31,107,99,0.06)',
        card: '0 2px 12px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)',
        dock: '0 -2px 24px rgba(31,107,99,0.12), 0 4px 20px rgba(31,107,99,0.14)',
      },
    },
  },
  plugins: [],
}
