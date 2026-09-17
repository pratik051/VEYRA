export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f',
        },
        sunset: {
          cream: '#FFEDB9',
          yellow: '#FFCB56',
          orange: '#FFA259',
          coral: '#FF7E7E',
          charcoal: '#2C2C2C',
          dark: '#1E1E1E',
        },
        coral: {
          DEFAULT: '#FF7E7E',
          50: '#FFF1F1',
          100: '#FFE4E4',
          400: '#FF9696',
          500: '#FF7E7E',
          600: '#FF6464',
          700: '#E65555',
        },
        'soft-orange': {
          DEFAULT: '#FFA259',
          50: '#FFF6EF',
          100: '#FFEADF',
          400: '#FFB377',
          500: '#FFA259',
          600: '#FF913D',
          700: '#E57E29',
        },
        'warm-yellow': {
          DEFAULT: '#FFCB56',
          50: '#FFFBF0',
          100: '#FFF5D6',
          400: '#FFD777',
          500: '#FFCB56',
          600: '#FFBF38',
          700: '#E5A51E',
        },
        'light-cream': {
          DEFAULT: '#FFEDB9',
          50: '#FFFAF0',
          100: '#FFF5DC',
          200: '#FFEDB9',
          300: '#FFE499',
        },
        charcoal: {
          DEFAULT: '#2C2C2C',
          50: '#F5F5F5',
          100: '#E5E5E5',
          500: '#707070',
          700: '#404040',
          800: '#2C2C2C',
          900: '#1E1E1E',
        },
      }
    },
  },
  plugins: [],
}
