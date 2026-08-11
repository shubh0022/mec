/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vanta: {
          950: "#050505",
          900: "#0A0A0A",
          850: "#121212",
          800: "#18181B",
          700: "#27272A",
          600: "#3F3F46",
          500: "#71717A",
          400: "#A1A1AA",
          300: "#D4D4D8",
          200: "#E4E4E7",
          100: "#F4F4F5",
          50: "#FAFAFA",
        },
        nvidia: {
          DEFAULT: "#76B900",
          50: "#F5FBF0",
          100: "#EAF7DD",
          200: "#D4EFBA",
          300: "#B8E48F",
          400: "#9BD55E",
          500: "#76B900",
          600: "#609600",
          700: "#497200",
          800: "#345100",
          900: "#203200",
          darkbg: "#132400",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif"
        ],
        mono: [
          '"JetBrains Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace"
        ]
      }
    },
  },
  plugins: [],
}
