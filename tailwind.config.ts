import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      colors: {
        ink: {
          950: "var(--color-ink-950)",
          900: "var(--color-ink-900)",
          700: "var(--color-ink-700)",
          600: "var(--color-ink-600)",
          500: "var(--color-ink-500)",
          400: "var(--color-ink-400)"
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)"
        },
        surface: {
          100: "var(--color-surface-100)",
          50: "var(--color-surface-50)",
          25: "var(--color-surface-25)",
          0: "var(--color-surface-0)"
        },
        brand: {
          600: "var(--color-brand-600)",
          500: "var(--color-brand-500)",
          400: "var(--color-brand-400)",
          100: "var(--color-brand-100)",
          50: "var(--color-brand-50)"
        },
        staking: {
          primary: {
            500: "var(--color-staking-primary-500)"
          }
        },
        cta: {
          bg: "var(--cta-bg)",
          "bg-hover": "var(--cta-bg-hover)",
          "bg-active": "var(--cta-bg-active)",
          "bg-disabled": "var(--cta-bg-disabled)",
          "bg-activated": "var(--cta-bg-activated)",
          text: "var(--cta-text)",
          "text-disabled": "var(--cta-text-disabled)",
          "text-activated": "var(--cta-text-activated)"
        },
        success: {
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
          bg: "var(--color-success-bg)"
        },
        warning: {
          600: "var(--color-warning-600)",
          400: "var(--color-warning-400)",
          bg: "var(--color-warning-bg)",
          soft: "var(--color-warning-soft)"
        },
        danger: {
          500: "var(--color-danger-500)"
        },
        overlay: "var(--color-overlay)",
        tooltip: {
          bg: "var(--color-tooltip-bg)",
          text: "var(--color-tooltip-text)"
        },
        rk: {
          "modal-text-secondary": "var(--rk-colors-modalTextSecondary)",
          "accent-color": "var(--rk-colors-accentColor)"
        }
      },
      boxShadow: {
        primary: "var(--shadow-primary)"
      },
      opacity: {
        "cta-pattern": "var(--cta-pattern-opacity)",
        "cta-pattern-disabled": "var(--cta-pattern-opacity-disabled)",
        "cta-pattern-activated": "var(--cta-pattern-opacity-activated)"
      }
    }
  },
  plugins: []
};

export default config;
