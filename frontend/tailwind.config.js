/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        apple: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D1D1D6',
            300: '#C7C7CC',
            400: '#8E8E93',
            500: '#636366',
            600: '#48484A',
            700: '#3A3A3C',
            800: '#2C2C2E',
            900: '#1C1C1E',
          },
        },
      },
      boxShadow: {
        apple: '0 2px 12px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        glow: '0 0 40px rgba(0, 122, 255, 0.15)',
      },
      borderRadius: {
        apple: '20px',
        card: '16px',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
