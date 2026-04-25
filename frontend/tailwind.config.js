/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        /* — Primary (Sage Green) — */
        primary:   { DEFAULT: "#56642b", container: "#8a9a5b", on: "#ffffff", "on-container": "#253000", fixed: "#d9eaa3", "fixed-dim": "#bdce89" },
        /* — Secondary (Muted Carrot) — */
        secondary: { DEFAULT: "#944a1b", container: "#ff9e68", on: "#ffffff", "on-container": "#773304", fixed: "#ffdbca", "fixed-dim": "#ffb68f" },
        /* — Tertiary (Berry) — */
        tertiary:  { DEFAULT: "#95454e", container: "#d57881", on: "#ffffff", "on-container": "#55141f", fixed: "#ffdadb", "fixed-dim": "#ffb2b8" },
        /* — Surfaces — */
        surface:   {
          DEFAULT:           "#fbf9f2",
          dim:               "#dcdad3",
          bright:            "#fbf9f2",
          "container-lowest":"#ffffff",
          "container-low":   "#f6f4ec",
          container:         "#f0eee7",
          "container-high":  "#eae8e1",
          "container-highest":"#e4e2dc",
          variant:           "#e4e2dc",
          tint:              "#56642b",
        },
        "on-surface":         "#1b1c18",
        "on-surface-variant":  "#46483c",
        outline:              "#76786b",
        "outline-variant":     "#c6c8b8",
        error:                "#ba1a1a",
      },
      borderRadius: {
        sm:      "4px",
        DEFAULT: "8px",
        md:      "12px",
        lg:      "16px",
        xl:      "24px",
        full:    "9999px",
      },
      boxShadow: {
        card:  "0 2px 12px rgba(45, 45, 42, 0.08)",
        soft:  "0 1px 6px  rgba(45, 45, 42, 0.06)",
        lift:  "0 4px 20px rgba(45, 45, 42, 0.10)",
      },
      spacing: {
        4.5: "18px",
        13:  "52px",
        15:  "60px",
        18:  "72px",
      },
    },
  },
  plugins: [],
};
