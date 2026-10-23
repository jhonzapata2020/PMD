/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pmd: {
          navy: '#0c2d57',      // Azul institucional oscuro
          blue: '#0052cc',      // Azul primario flecha
          gold: '#f59e0b',      // Amarillo dorado flecha
          red: '#dc2626',       // Rojo flecha
          light: '#f8fafc',
          dark: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
