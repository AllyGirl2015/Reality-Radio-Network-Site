import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          blue: '#00f3ff',
          cyan: '#0ff',
          purple: '#b026ff',
          pink: '#ff006e',
          orange: '#ff7b00',
        },
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme(colors.neon.blue), 0 0 20px theme(colors.neon.blue)',
        'neon-cyan': '0 0 5px theme(colors.neon.cyan), 0 0 20px theme(colors.neon.cyan)',
        'neon-purple': '0 0 5px theme(colors.neon.purple), 0 0 20px theme(colors.neon.purple)',
        'neon-pink': '0 0 5px theme(colors.neon.pink), 0 0 20px theme(colors.neon.pink)',
        'neon-strong-blue': '0 0 10px theme(colors.neon.blue), 0 0 40px theme(colors.neon.blue), 0 0 80px theme(colors.neon.blue)',
        'neon-strong-cyan': '0 0 10px theme(colors.neon.cyan), 0 0 40px theme(colors.neon.cyan), 0 0 80px theme(colors.neon.cyan)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.7',
          },
        },
        glow: {
          from: {
            textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff',
          },
          to: {
            textShadow: '0 0 20px #00f3ff, 0 0 30px #00f3ff, 0 0 40px #00f3ff, 0 0 50px #00f3ff',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
export default config;
