/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#F5F7FA',
        gold: {
          50:  '#FDF8E0',
          100: '#F9EDB3',
          200: '#F2DC80',
          300: '#E8CC6A',
          400: '#D4AF37',
          500: '#B8941E',
          600: '#9A7A10',
          700: '#7A600A',
          800: '#5C4706',
          900: '#3D2F04',
        },
        crimson: {
          400: '#D81F2D',
          500: '#C1121F',
          600: '#A00E19',
        },
        dark: {
          50:  '#F0F3F7',
          100: '#D8E0EA',
          200: '#B0BFD0',
          300: '#7A90AE',
          400: '#4A5E7A',
          500: '#2D3F5E',
          600: '#1E2D4A',
          700: '#141E33',
          800: '#0F1629',
          900: '#0B1020',
          950: '#050A14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'card-glow': 'cardGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cardGlow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.7)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
