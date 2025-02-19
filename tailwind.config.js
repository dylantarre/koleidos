/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playwrite PL', 'serif'],
      },
      colors: {
        'dark-blue': '#0f172a',
        'darker-blue': '#0a0f1d',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.2)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
