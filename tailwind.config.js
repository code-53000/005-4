/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f7f4',
          100: '#d9ece3',
          200: '#b3d9c7',
          300: '#82c0a5',
          400: '#4da07e',
          500: '#2f8563',
          600: '#0F4C3A',
          700: '#0c3d2f',
          800: '#0a3126',
          900: '#08281f',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc270',
          400: '#ff9f37',
          500: '#D97706',
          600: '#b35f00',
          700: '#8a4900',
          800: '#613300',
          900: '#3d1f00',
        },
        cream: {
          50: '#faf8f4',
          100: '#F5F0E8',
          200: '#ebe2d1',
          300: '#ddd0b5',
          400: '#c9b894',
          500: '#b5a073',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 76, 58, 0.15)',
        'card-hover': '0 8px 30px -4px rgba(15, 76, 58, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'shake': 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
