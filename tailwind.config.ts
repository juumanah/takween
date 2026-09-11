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
    DEFAULT: "#0E1B3D",
    50: "#F1F5FF",
    100: "#E3E9F7",
    200: "#C4CEE3",
    400: "#7180A3",
    600: "#405075",
    800: "#18284D",
    900: "#0E1B3D",
  },

  paper: "#FCFCFF",

  spark: {
    DEFAULT: "#4F7BFF",
    50: "#EEF2FF",
    100: "#DDE6FF",
    400: "#7193FF",
    500: "#4F7BFF",
    600: "#3E67E8",
    700: "#3153BD",
  },

  signal: "#34D1A7",

  accent: {
    DEFAULT: "#A78BFA",
    50: "#F5F1FF",
    100: "#EDE7FF",
    500: "#A78BFA",
    600: "#8D6FE8",
  },
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
