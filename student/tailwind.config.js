/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#3C3C3C',
        grass: { DEFAULT: '#58CC02', dark: '#46A302' },
        macaw: { DEFAULT: '#1CB0F6', dark: '#1899D6' },
        fox: { DEFAULT: '#FF9600', dark: '#E08600' },
        cardinal: { DEFAULT: '#FF4B4B', dark: '#E04343' },
        bee: { DEFAULT: '#FFC800', dark: '#E5B400' },
        beetle: { DEFAULT: '#CE82FF', dark: '#B368E0' },
        flamingo: { DEFAULT: '#FF86D0', dark: '#E070B5' },
        swan: '#E5E5E5',
        wolf: '#777777',
      },
      borderRadius: { '2xl': '1rem' },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.18s ease-out',
        'slide-up': 'slide-up 0.22s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
