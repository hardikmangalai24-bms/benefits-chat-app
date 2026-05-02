import type { Config } from "tailwindcss";

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
          DEFAULT: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.06)",
          hover: "rgba(255,255,255,0.08)",
        },
        accent: {
          cyan: "#818cf8",    // Indigo-400 — primary accent
          purple: "#a78bfa",  // Violet-400 — secondary accent
          gold: "#c084fc",    // Purple-400 — tertiary
        },
        dark: {
          900: "#09090b",     // Zinc-950
          800: "#0f0f13",
          700: "#18181b",     // Zinc-900
          600: "#1e1e24",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
