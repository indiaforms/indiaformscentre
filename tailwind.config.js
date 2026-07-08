/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-text)",
        cream: "var(--color-bg)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        input: "var(--color-input)",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
