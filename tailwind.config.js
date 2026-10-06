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
          green: "#1F7A4D",
          "yellow-green": "#5E7F1E",
          yellow: "#9A7400",
          orange: "#B4531A",
          red: "#B3261E",
        },
      },
      fontFamily: {
        display: ["Newsreader", "Georgia", "Times New Roman", "serif"],
        body: ["Libre Franklin", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["Libre Franklin", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "9999px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
