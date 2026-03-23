/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 40px rgba(0,0,0,0.18)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 30px 90px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}

