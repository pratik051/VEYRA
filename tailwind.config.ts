import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        veyra: {
          black: "#0b0b0c",
          charcoal: "#141416",
          dark: "#1b1b1f",
          gold: "#c5a059",
          "gold-light": "#dfc384",
          "gold-dark": "#9b7832",
          light: "#f8f8f9",
          muted: "#8e8e93",
          border: "#e5e5ea"
        }
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 36px rgba(0,0,0,0.11)",
        gold: "0 4px 18px rgba(197,160,89,0.28)",
        modal: "0 24px 80px rgba(0,0,0,0.22)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        modalEnter: {
          from: { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" }
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        riseUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "modal-enter": "modalEnter 0.26s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-down": "slideDown 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
        "rise-up": "riseUp 0.30s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
