/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SvatBot brand colors - now using CSS variables for dynamic theming
        primary: {
          50: 'var(--color-primary-50, #fdf2f8)',
          100: 'var(--color-primary-100, #fce7f3)',
          200: 'var(--color-primary-200, #fbcfe8)',
          300: 'var(--color-primary-300, #f9a8d4)',
          400: 'var(--color-primary-400, #f472b6)',
          500: 'var(--color-primary, #F8BBD9)', // Main brand color - Dynamic
          600: 'var(--color-primary-600, #db2777)',
          700: 'var(--color-primary-700, #be185d)',
          800: 'var(--color-primary-800, #9d174d)',
          900: 'var(--color-primary-900, #831843)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #faf5ff)',
          100: 'var(--color-secondary-100, #f3e8ff)',
          200: 'var(--color-secondary-200, #e9d5ff)',
          300: 'var(--color-secondary-300, #d8b4fe)',
          400: 'var(--color-secondary-400, #c084fc)',
          500: 'var(--color-secondary, #E1D5E7)', // Dynamic
          600: 'var(--color-secondary-600, #9333ea)',
          700: 'var(--color-secondary-700, #7c3aed)',
          800: 'var(--color-secondary-800, #6b21a8)',
          900: 'var(--color-secondary-900, #581c87)',
        },
        accent: {
          50: 'var(--color-accent-50, #fffbeb)',
          100: 'var(--color-accent-100, #fef3c7)',
          200: 'var(--color-accent-200, #fde68a)',
          300: 'var(--color-accent-300, #fcd34d)',
          400: 'var(--color-accent-400, #fbbf24)',
          500: 'var(--color-accent, #F7DC6F)', // Dynamic
          600: 'var(--color-accent-600, #d97706)',
          700: 'var(--color-accent-700, #b45309)',
          800: 'var(--color-accent-800, #92400e)',
          900: 'var(--color-accent-900, #78350f)',
        },
        neutral: {
          50: '#FDFEFE', // Cream White
          100: '#f8fafc',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        text: {
          primary: '#2C3E50', // Charcoal
          secondary: '#64748b',
          muted: '#94a3b8',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#A9DFBF', // Sage Green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'], // Headers
        'sans': ['Inter', 'system-ui', 'sans-serif'], // Body
        'button': ['Montserrat', 'system-ui', 'sans-serif'], // Buttons
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'wedding': '0 4px 25px -5px rgba(248, 187, 217, 0.3), 0 10px 30px -5px rgba(225, 213, 231, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-rotate': 'floatRotate 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-bottom': 'slideInBottom 0.5s ease-out',
        'rotate-in': 'rotateIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'flip-in': 'flipIn 0.6s ease-out',
        'elastic-bounce': 'elasticBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake': 'shake 0.5s ease-in-out',
        'swing': 'swing 1s ease-in-out',
        'zoom-in': 'zoomIn 0.5s ease-out',
        'wave': 'wave 1s ease-in-out infinite',
        'page-enter': 'pageEnter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'page-exit': 'pageExit 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'marquee': 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 60s linear infinite',
        'reveal': 'reveal 0.3s ease-out',
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
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pageExit: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(1.04) translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
