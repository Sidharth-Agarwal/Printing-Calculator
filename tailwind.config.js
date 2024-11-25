/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in src folder with js, jsx, ts, or tsx extensions
    "./index.html",               // Include index.html for Tailwind styles in the root
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};