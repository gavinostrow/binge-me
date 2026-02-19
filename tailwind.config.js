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
          primary: "#0D0D12",
          surface: "#15151D",
          elevated: "#1C1C28",
          hover: "#252533",
        },
        text: {
          primary: "#E8E4DC",
          secondary: "#9994A8",
          muted: "#5E586E",
        },
        accent: {
          purple: "#8B5CF6",
          gold: "#D4A843",
        },
        rating: {
          green: "#22C55E",
          "yellow-green": "#84CC16",
          yellow: "#EAB308",
          orange: "#F97316",
          red: "#EF4444",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Karla", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
