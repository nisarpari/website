import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bella: {
          50: "#faf9f7",
          100: "#f5f3ef",
          200: "#e8e4dd",
          300: "#d4cec3",
          400: "#b8ae9e",
          500: "#9d8f7b",
          600: "#8a7d6a",
          700: "#726758",
          800: "#5f564b",
          900: "#504840",
        },
        gold: {
          light: "#2ea5b8",
          DEFAULT: "#1a8a9c",
          dark: "#0d6e7d",
        },
        navy: {
          light: "#2c3e50",
          DEFAULT: "#1a252f",
          dark: "#0d1318",
        },
        // Bella brand blue (from logo) - darker for better visibility
        brand: {
          light: "#2ea5b8",
          DEFAULT: "#1a8a9c",
          dark: "#0d6e7d",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Montserrat", "sans-serif"],
        product: ["Plus Jakarta Sans", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease",
        "slide-up": "slideUp 0.8s ease forwards",
        float: "float 3s ease-in-out infinite",
        spin: "spin 1s linear infinite",
        "stagger-in": "staggerIn 0.6s ease forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        staggerIn: {
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
