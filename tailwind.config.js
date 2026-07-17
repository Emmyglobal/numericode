/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#1E3A5F',
          blue:  '#2E75B6',
          sky:   '#4A9FD4',
          light: '#D5E8F0',
        },
        surface: { DEFAULT: '#FFFFFF', dark: '#1A1F2E' },
        bg:      { DEFAULT: '#F7F8FA', dark: '#0F1117' },
        teal:    { DEFAULT: '#0D7377', light: '#D0EFEF' },
        purple:  { DEFAULT: '#5C3D91', light: '#EDE9F7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(46,117,182,0.35)',
        card:  '0 4px 12px rgba(0,0,0,0.08)',
        lg:    '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: { DEFAULT: '8px' },
    },
  },
  plugins: [],
}
