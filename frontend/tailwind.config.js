/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#090A0D',
        surface: {
          1: '#101217',
          2: '#161920',
          3: '#1D212A',
        },
        ink: {
          primary: '#F3F4F6',
          secondary: '#9BA1AE',
          muted: '#8E95A5',
        },
        signal: {
          ok: '#10B981',
          warn: '#F59E0B',
          crit: '#F43F5E',
          accent: '#38BDF8',
        },
        border: "rgba(255, 255, 255, 0.07)",
        background: "#090A0D",
        foreground: "#F3F4F6",
      },
      boxShadow: {
        'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.09)',
        'halo-ok': '0 0 0 3px rgba(16, 185, 129, 0.15)',
        'halo-warn': '0 0 0 3px rgba(245, 158, 11, 0.15)',
        'halo-crit': '0 0 0 3px rgba(244, 63, 94, 0.20)',
        'halo-accent': '0 0 0 3px rgba(56, 189, 248, 0.20)',
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
}
