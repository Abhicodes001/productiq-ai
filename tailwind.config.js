/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        industrial: {
          50: '#f4f6f8',
          100: '#e5e9ee',
          200: '#cfd7e1',
          300: '#adbccb',
          400: '#849bb0',
          500: '#647c94',
          600: '#4e6378',
          700: '#3f5062',
          800: '#2b3644',
          900: '#161c24',
          950: '#0d1117',
        },
        brand: {
          DEFAULT: '#0284c7', // Professional industrial cyan/blue
          hover: '#0369a1',
          subtle: '#e0f2fe',
          accent: '#0f172a',
        },
        status: {
          processing: '#0284c7',
          needs_review: '#d97706',
          verified: '#059669',
          failed: '#dc2626',
          draft: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
