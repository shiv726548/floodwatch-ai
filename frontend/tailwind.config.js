module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1220',
        panel: '#111b2d',
        accent: '#2dd4bf',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        purple: '#8b5cf6',
        muted: '#94a3b8'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.35)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
};
