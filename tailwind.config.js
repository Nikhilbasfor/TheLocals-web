/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        traveller: {
          forestDark: '#0D3B2E',
          mint: '#10B981',
          lightMint: '#E6F4F0',
          softMint: '#D1FAE5',
          teal: '#0F6E56',
        },
        guide: {
          primary: '#1B365D',
          navy: '#1B365D',
          headerDark: '#0F172A',
          skyBlue: '#F0F7FF',
          cyan: '#06B6D4',
          terracotta: '#E05A47',
          darkBg: '#13151C',
          darkCard: '#1E222D',
          darkBorder: '#2A2F3D',
        },
        brand: {
          green: '#10B981',
          orange: '#F97316',
          red: '#EF4444',
          terracotta: '#E05A47',
          amber: '#EF9F27',
        },
        neutral: {
          textMain: '#1E293B',
          textMuted: '#64748B',
          cardBorder: '#E2E8F0',
          bgLight: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'kenburns': 'kenburns 24s ease-in-out infinite alternate',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1.15) translate(1%, 0)' },
        }
      }
    },
  },
  plugins: [],
}
