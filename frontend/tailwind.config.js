/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pixelify Sans"', 'system-ui', 'sans-serif'],
        pixel: ['"Pixelify Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        silkscreen: ['"Silkscreen"', 'monospace'],
        grotesk: ['"Space Grotesk"', '"JetBrains Mono"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: 'var(--fg)',
          soft: 'var(--soft)',
          line: 'var(--line)',
        },
        butter: '#FFE680',
        checker: '#FFDD5E',
        cream: '#FFF8DC',
        ketchup: '#FF4D3D',
        sky: '#59C9F5',
        grass: '#43D17A',
        grape: '#7C5CFF',
        orange: '#FF9F43',
        pink: '#FF8AD0',
        line: 'var(--line)',
        shadowcol: 'var(--shadow-col)',
        card: 'var(--card)',
        navbg: 'var(--nav-bg)',
      },
      boxShadow: {
        'pixel-sm': '3px 3px 0 var(--shadow-col)',
        'pixel': '4px 4px 0 var(--shadow-col)',
        'pixel-lg': '6px 6px 0 var(--shadow-col)',
        'pixel-xl': '8px 8px 0 var(--shadow-col)',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}
