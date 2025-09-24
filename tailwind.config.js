/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        midnight: '#0f172a',
        fog: 'rgba(255, 255, 255, 0.65)',
      },
      backgroundImage: {
        aurora: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.35))',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
