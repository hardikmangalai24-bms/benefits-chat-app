import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.08)",
        },
        accent: {
          cyan: "#00D4FF",
          purple: "#A855F7",
          gold: "#F59E0B",
        },
        dark: {
          900: "#020308",
          800: "#080C14",
          700: "#0D1420",
          600: "#141C2E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".glass-card": {
          "@apply backdrop-blur-xl border border-white/10 bg-white/5 rounded-xl": {},
        },
        ".glass-input": {
          "@apply backdrop-blur-xl border border-white/10 bg-white/5 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all":
            {},
        },
        ".glass-button": {
          "@apply backdrop-blur-xl border border-white/10 bg-white/5 rounded-lg px-6 py-3 text-white font-medium hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all":
            {},
        },
      });
    }),
  ],
};
export default config;

// Made with Bob
