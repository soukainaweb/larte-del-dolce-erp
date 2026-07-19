/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"],
        inter: ["Inter", "sans-serif"],
      },

      colors: {
        brand: {
          DEFAULT: "#CBA26E",
          50: "#fbf6ee",
          100: "#f5ead5",
          200: "#ecd5aa",
          300: "#dfb97a",
          400: "#d29c4a",
          500: "#CBA26E",
          600: "#b0885a",
          700: "#8c6a42",
          800: "#6b4f2e",
          900: "#4d381d",
        },

        cream: {
          50: "#FDFBF7",
        },

        dark: "#1F2937",

        border: "#E5E7EB",
      },

      boxShadow: {
        card: "0 15px 40px rgba(0,0,0,.08)",
        gold: "0 10px 30px rgba(203,162,110,.25)",
      },

      borderRadius: {
        xl2: "22px",
      },
    },
  },

  plugins: [],
};