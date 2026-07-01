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
          DEFAULT: 'oklch(0.650 0.180 140.0)',
          light: 'oklch(0.740 0.155 140.0)',
          dark: 'oklch(0.550 0.200 140.0)',
        },
        accent: {
          DEFAULT: 'oklch(0.750 0.155 55.0)',
          light: 'oklch(0.880 0.110 60.0)',
        },
        correct: 'oklch(0.680 0.190 140.0)',
        wrong: 'oklch(0.620 0.210 25.0)',
        warning: 'oklch(0.800 0.155 80.0)',
        star: 'oklch(0.750 0.155 55.0)',
      },
      maxWidth: {
        content: '72rem',
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'page-fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
