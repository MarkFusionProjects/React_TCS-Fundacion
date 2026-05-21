/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'columbus-blue': '#004990',
        'columbus-navy': '#003870',
        'columbus-green': '#92c83e',
        'columbus-green-dark': '#7ab82f',
      },
    },
  },
  plugins: [],
}