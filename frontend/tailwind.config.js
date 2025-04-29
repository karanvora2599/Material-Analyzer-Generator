/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",                      // ✅ must be "class"
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",                // ✅ include all JSX
  ],
  theme: { extend: {} },
  plugins: [],
};