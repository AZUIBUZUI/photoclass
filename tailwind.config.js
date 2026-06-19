/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#FFFFFF',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          700: '#C7C7CC',
          750: '#AEAEB2',
          800: '#8E8E93',
          850: '#636366',
          900: '#3A3A3C',
          950: '#1C1C1E',
        },
        accent: {
          400: '#409CFF',
          500: '#007AFF',
          600: '#0062CC',
        },
        ios: {
          red: '#FF3B30',
          orange: '#FF9F0A',
          green: '#34C759',
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'ios': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'ios-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'ios-lg': '0 8px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
};
