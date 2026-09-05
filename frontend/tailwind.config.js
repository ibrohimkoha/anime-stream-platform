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
          bg: '#090B10',
          surface: '#111420',
          card: 'rgba(17, 20, 32, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(226, 232, 240, 0.9)',
        },
        primary: {
          DEFAULT: '#9333EA',
          hover: '#7E22CE',
          light: '#C084FC',
        },
        vip: {
          DEFAULT: '#F59E0B',
          glow: '#FBBF24',
        },
        accent: {
          sakura: '#F43F5E',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
