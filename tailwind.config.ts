import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./components/layout/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        veyra: {
          bg: "#fcfcfd",
          surface: "#ffffff",
          "surface-2": "#f5f5f5",
          "surface-3": "#eaeaea",
          text: "#111114",
          "text-dark": "#0a0a0b",
          gold: "#C9A84C",
          "gold-light": "#E8C97A",
          "gold-pale": "#f5d98a",
          "gold-dark": "#b8912e",
          "gold-dim": "#8a6520",
          muted: "#6e6e80",
          border: "rgba(0,0,0,0.06)",
          "border-gold": "rgba(201,168,76,0.25)"
        }
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
        "card-hover": "0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(201,168,76,0.15)",
        "gold-glow": "0 8px 30px rgba(201,168,76,0.25), 0 0 50px rgba(201,168,76,0.1)",
        "gold-glow-lg": "0 16px 50px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.15)",
        gold: "0 4px 18px rgba(201,168,76,0.25)",
        modal: "0 24px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
        header: "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"]
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8C97A 45%, #b8912e 100%)",
        "light-gradient": "linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%)",
        "hero-gradient": "radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 50%)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        shimmerGold: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        modalEnter: {
          from: { opacity: "0", transform: "scale(0.93) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" }
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        riseUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201,168,76,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(201,168,76,0.3)" }
        },
        orbFloat: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-20px) scale(1.05)" },
          "66%": { transform: "translate(-20px,15px) scale(0.98)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "shimmer-gold": "shimmerGold 2.4s ease-in-out infinite",
        "modal-enter": "modalEnter 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-down": "slideDown 0.24s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "rise-up": "riseUp 0.36s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 5s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "orb-float": "orbFloat 10s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
