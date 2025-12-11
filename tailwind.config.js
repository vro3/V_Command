/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom background layers
        'base': '#0B1120',
        'surface': '#0f172a',
        'elevated': '#1e293b',
        // Gold accent from Show_Sync
        'accent': {
          DEFAULT: '#D4A857',
          hover: '#E6BE6A',
          subtle: 'rgba(212, 168, 87, 0.1)',
          glow: 'rgba(212, 168, 87, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'table': ['0.8125rem', { lineHeight: '1.25rem' }],
        'label': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
