/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#15110d",
          panel: "#1c1712",
          card: "#221c16",
          hover: "#2a231b",
          border: "#332b21",
        },
        gold: {
          50: "#faf3e7",
          100: "#f3e3c4",
          200: "#e8cd9a",
          300: "#dcb877",
          400: "#d4a574",
          500: "#c9925a",
          600: "#b87f45",
          700: "#96652f",
        },
        cream: "#efe2c9",
        muted: "#9c8f7e",
        subtle: "#6f6355",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(212, 165, 116, 0.15)",
      },
    },
  },
  plugins: [],
};
