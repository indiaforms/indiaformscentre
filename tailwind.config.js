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
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Outfit", "Helvetica Neue", "Arial", "sans-serif"],
      },
      perspective: {
        "800": "800px",
        "1200": "1200px",
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "shimmer": "shimmer 4s linear infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease both",
        "spin-slow": "spin-slow 20s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glow-blue": "0 0 30px rgba(59,130,246,0.35), 0 4px 20px rgba(0,0,0,0.15)",
        "glow-green": "0 0 30px rgba(16,185,129,0.30), 0 4px 20px rgba(0,0,0,0.15)",
        "glow-blue-strong": "0 0 50px rgba(29,78,216,0.55), 0 0 100px rgba(59,130,246,0.25)",
        "card-3d": "0 30px 80px rgba(29,78,216,0.20), 0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
