/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ff6b9d',
          light: '#ff8fb4',
          dark: '#ff4081',
        },
        correct: '#4ade80',
        wrong: '#f87171',
        warning: '#fbbf24',
        game: {
          cyan: '#4DD0E1',
          mint: '#81C784',
          bg: '#f0faf5',
        },
        parent: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#4DD0E1',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
      },
      maxWidth: {
        content: '72rem',
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'page-fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
