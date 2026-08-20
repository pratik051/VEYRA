import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        veyra: {
          black: "#0b0b0c",
          gold: "#c9a86a",
          light: "#f5f5f5"
        }
      },
      boxShadow: {
        card: "0 8px 28px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
