/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          surface: "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-text) / <alpha-value>)",
          purple: "rgb(var(--accent) / <alpha-value>)",
          gold: "rgb(var(--gold) / <alpha-value>)",
        },
        rating: {
          green: "#2E9E63",
          "yellow-green": "#7FA331",
          yellow: "#C29A1F",
          orange: "#D2702A",
          red: "#D64545",
        },
      },
      fontFamily: {
        display: ["Geist", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["Geist", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "5px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        "3xl": "12px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
