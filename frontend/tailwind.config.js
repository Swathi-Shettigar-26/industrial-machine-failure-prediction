/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070A12',
          900: '#0B0F19',
          850: '#0F1524',
          800: '#141C30',
          700: '#1E2A47',
          600: '#2C3E69',
        },
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        electric: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
