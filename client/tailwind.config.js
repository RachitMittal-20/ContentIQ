/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        iq: {
          bg: '#0A0A0F',
          surface: '#13131A',
          border: '#1E1E2E',
          purple: '#6C63FF',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#F8F8FF',
          secondaryText: '#8B8BA7',
        },
      },
    },
  },
  plugins: [],
};

