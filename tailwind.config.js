/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#B8860B',
          50: '#FDF8EC',
          100: '#F5E8B8',
          200: '#EDCF7A',
          300: '#D4A017',
          400: '#B8860B',
          500: '#9A6F08',
        },
        blush: {
          DEFAULT: '#E8DDD0',
          50: '#FAF7F4',
          100: '#F3ECE4',
          200: '#E8DDD0',
          300: '#D9C8B4',
          400: '#C4A98C',
        },
        ink: {
          DEFAULT: '#1C1C1C',
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#CFCFCF',
          300: '#A8A8A8',
          400: '#707070',
          500: '#3D3D3D',
          600: '#1C1C1C',
        },
        surface: '#FAFAF8',
        card: '#FFFFFF',
        border: '#EBEBEB',
        success: '#2D6A4F',
        charcoal: {
          DEFAULT: '#1a1a1a',
          50: '#2a2a2a',
          100: '#242424',
          200: '#1e1e1e',
          300: '#1a1a1a',
          400: '#141414',
          500: '#0e0e0e',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          100: '#faf8f3',
          200: '#f5f0e8',
          300: '#ede4d4',
          400: '#e0d4be',
        },
        gold: {
          DEFAULT: '#c9a96e',
          100: '#e8d4a8',
          200: '#dfc18a',
          300: '#c9a96e',
          400: '#b8934e',
          500: '#9e7a34',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        pill: '24px',
        input: '4px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
