const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: { sans: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'], mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'] },
      colors: {
        white: v('white'),
        slate: {
          50: v('slate-50'), 100: v('slate-100'), 200: v('slate-200'), 300: v('slate-300'),
          400: v('slate-400'), 500: v('slate-500'), 600: v('slate-600'),
          700: v('slate-700'), 800: v('slate-800'), 900: v('slate-900'), 950: v('slate-950')
        },
        brand: { 50: v('brand-50'), 500: v('brand-500'), 600: v('brand-600'), 900: v('brand-900') }
      }
    }
  }
}
