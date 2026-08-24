import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12141F",
          50: "#F4F4F7",
          100: "#E4E5EC",
          200: "#C3C5D6",
          400: "#6C6F8C",
          600: "#3A3D57",
          800: "#1C1E2E",
          900: "#12141F",
        },
        paper: "#F7F5F0",
        spark: {
          DEFAULT: "#4B4FE0",
          50: "#EEEEFC",
          100: "#DBDCF9",
          400: "#6A6DE8",
          500: "#4B4FE0",
          600: "#3A3DBE",
          700: "#2C2E93",
        },
        signal: "#E8B04B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,20,31,0.06), 0 8px 24px -12px rgba(18,20,31,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
