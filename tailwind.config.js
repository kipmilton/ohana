/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ohana: {
          terracotta: {
            DEFAULT: '#B93826',
            50: '#FDF4F3',
            100: '#FBE6E4',
            200: '#F6C8C3',
            300: '#EE9E95',
            400: '#E46E60',
            500: '#B93826',
            600: '#A42C1B',
            700: '#872113',
            800: '#6C1A0F',
            900: '#4D120B',
          },
          gold: {
            DEFAULT: '#C99738',
            50: '#FDF9EF',
            100: '#FAF1DC',
            200: '#F3DEB2',
            300: '#EBC783',
            400: '#E1AD4F',
            500: '#C99738',
            600: '#AC7B24',
            700: '#865E1B',
            800: '#624415',
          },
          green: {
            DEFAULT: '#45A041',
            50: '#F2F9F2',
            100: '#E3F2E3',
            500: '#45A041',
            600: '#388835',
            700: '#2A6B28',
          },
          charcoal: {
            DEFAULT: '#252924',
            50: '#F5F6F5',
            100: '#E7E9E6',
            200: '#CFD3CD',
            700: '#3D423C',
            800: '#2C302B',
            900: '#1D211C',
            950: '#121411',
          },
          sand: {
            DEFAULT: '#FAF7F2',
            50: '#FCFAF7',
            100: '#F5F0E6',
            200: '#ECE3D4',
            300: '#DDD0BC',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
