/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderColor: {
        border: "var(--color-border)",
      },
      outlineColor: {
        ring: "var(--color-ring)",
      },
      backgroundColor: {
        background: "var(--color-background)",
      },
      textColor: {
        foreground: "var(--color-foreground)",
      },
    },
  },
  plugins: [],
};