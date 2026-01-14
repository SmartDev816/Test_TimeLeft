/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "#020617",
        surfaceMuted: "#020617",
        // brand-inspired accents
        accent: "#FF6347", // tomato
        accentSoft: "#FF826C",
        accentPowder: "#B0E0E6", // powderblue
        borderSubtle: "#1E293B"
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.2rem"
      },
      boxShadow: {
        "soft-lg": "0 18px 45px rgba(15, 23, 42, 0.6)",
        "card": "0 18px 40px rgba(15, 23, 42, 0.45)"
      }
    },
    fontFamily: {
      sans: ["system-ui", "ui-sans-serif", "system-ui", "sans-serif"]
    }
  },
  plugins: []
};

export default config;


