/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0d13',
        foreground: '#f3f4f6',
        card: {
          DEFAULT: '#12151e',
          foreground: '#f3f4f6',
          elevated: '#171b26',
          highlight: '#1f2433',
        },
        primary: {
          DEFAULT: '#8b5cf6', // Lavender purple accent
          hover: '#7c3aed',
          light: '#a78bfa',
          soft: 'rgba(139, 92, 246, 0.15)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1f2430',
          foreground: '#9ca3af',
        },
        muted: {
          DEFAULT: '#161a24',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#c084fc',
          foreground: '#ffffff',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        leak: {
          high: '#f43f5e',
          likely: '#fb923c',
          low: '#facc15',
          safe: '#10b981',
        },
        status: {
          pass: '#10b981',
          blocked: '#ef4444',
          warning: '#f59e0b',
          running: '#8b5cf6',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
