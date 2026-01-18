/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vcPrimary: '#0f172a',
        vcAccent: '#2563eb',
      }
    },
  },
  plugins: [],
}

