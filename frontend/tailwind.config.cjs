// tailwind.config.js (new file: create this at the root of your project)
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#00bf63',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#004934ff'
        },
      },
    },
  },
  plugins: [],
}