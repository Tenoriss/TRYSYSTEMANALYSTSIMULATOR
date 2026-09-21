/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(99,102,241,0.18)',
        'glow-md': '0 0 40px rgba(99,102,241,0.22)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
