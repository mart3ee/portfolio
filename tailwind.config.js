/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          main: '#0f172a', // Slate 900
          alt: '#020617', // Slate 950
          surface: '#1e293b', // Slate 800
          highlight: '#334155', // Slate 700
        },
        text: {
          main: '#f8fafc', // Slate 50
          muted: '#94a3b8', // Slate 400
          inverted: '#0f172a', // Slate 900
        },
        primary: {
          DEFAULT: '#0ea5e9', // Sky 500
          dark: '#0284c7', // Sky 600
          light: '#38bdf8', // Sky 400
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet 500
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
