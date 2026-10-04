import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          DEFAULT: "var(--brand-primary)",
        },
        accent: {
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          DEFAULT: "var(--accent-primary)",
        },
        surface: {
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          card: "var(--surface-card)",
          border: "var(--surface-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "Tajawal", "sans-serif"],
        cairo: ["var(--font-cairo)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(11, 122, 90, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 10px 30px -4px rgba(11, 122, 90, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        highlight: "0 12px 35px -5px rgba(11, 122, 90, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
