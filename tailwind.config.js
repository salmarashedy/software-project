/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dev: {
          bg: 'rgb(var(--dev-bg) / <alpha-value>)',
          surface: 'rgb(var(--dev-surface) / <alpha-value>)',
          card: 'rgb(var(--dev-card) / <alpha-value>)',
          border: 'rgb(var(--dev-border) / <alpha-value>)',
          primary: 'rgb(var(--dev-primary) / <alpha-value>)',
          accent: 'rgb(var(--dev-accent) / <alpha-value>)',
          text: {
            main: 'rgb(var(--dev-text-main) / <alpha-value>)',
            muted: 'rgb(var(--dev-text-muted) / <alpha-value>)',
          },
        },
      },
    },
  },
  plugins: [],
}
