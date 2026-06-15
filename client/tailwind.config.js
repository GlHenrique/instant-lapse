export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        panel: "#161B22",
        panel2: "#1C232C",
        line: "#262E38",
        fg: "#E6EAF0",
        muted: "#8A94A6",
        amber: "#F5A623",
        amberdim: "#C9871D",
        teal: "#2DD4BF",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};
