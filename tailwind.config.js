/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Bengali"', '"Hind Siliguri"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      animation: {
        'marquee': 'marquee 50s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
