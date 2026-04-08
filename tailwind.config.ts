import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NBA-inspired palette
        court: {
          DEFAULT: '#1d1160',  // deep navy (NBA logo blue)
          light: '#253b80',
          dark: '#0e0a33',
        },
        flame: {
          DEFAULT: '#e04e39',  // bold red-orange
          light: '#f06b52',
          dark: '#c43a27',
        },
        gold: {
          DEFAULT: '#fdb927',  // Lakers gold / NBA trophy
          light: '#fdd85d',
          dark: '#d9a020',
        },
        hardwood: {
          DEFAULT: '#c4a265',  // court wood tone
          light: '#e8d5a8',
          dark: '#8b6f3a',
        },
        slate: {
          50: '#f8f9fb',
          100: '#eef0f4',
          200: '#dde1e8',
          300: '#bcc3cf',
          400: '#8e98a8',
          500: '#64708a',
          600: '#4a5568',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
