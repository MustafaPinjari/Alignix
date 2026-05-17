/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f1117",
          1: "#161b27",
          2: "#1e2535",
          3: "#252d3d",
        },
        accent: {
          DEFAULT: "#4f8ef7",
          hover: "#6ba3ff",
          muted: "#1e3a6e",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#6b7280",
        border: "#2a3347",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { xl: "12px", "2xl": "16px" },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(79,142,247,0.15)",
      },
    },
  },
  plugins: [],
};
