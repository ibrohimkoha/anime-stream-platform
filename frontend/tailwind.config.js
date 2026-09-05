/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090A0F',
          surface: '#12151F',
          card: 'rgba(18, 21, 31, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.9)',
          border: 'rgba(0, 0, 0, 0.08)',
        },
        primary: {
          DEFAULT: '#8A2BE2',
          hover: '#7C3AED',
          light: '#A78BFA',
        },
        vip: {
          DEFAULT: '#F59E0B',
          glow: '#FFD700',
        },
        accent: {
          sakura: '#FF70A6',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
