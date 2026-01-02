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
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        product: ["var(--font-product)", "system-ui", "sans-serif"],
      },
      // Luxury transition timing
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
        "luxury-in-out": "cubic-bezier(0.76, 0, 0.24, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      // Luxury duration scale
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      // Custom scale for subtle hover
      scale: {
        "102": "1.02",
        "103": "1.03",
        "108": "1.08",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 4s ease-in-out infinite",
        spin: "spin 1s linear infinite",
        "stagger-in": "staggerIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
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
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
