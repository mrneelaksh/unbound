import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:             '#050505',
        'bg-secondary': '#0B0B0B',
        surface:        '#101010',
        card:           '#101010',
        elevated:       '#161616',
        text:           '#F5F5F5',
        muted:          '#A1A1A1',
        subtle:         '#6F6F6F',
        border:         'rgba(255,255,255,0.10)',
        'border-subtle':'rgba(255,255,255,0.06)',
        // Intentional High-Tech Light Green Accent
        accent:         '#C7FF72',
        'accent-secondary': '#A7E85B',
        'accent-dim':   'rgba(199, 255, 114, 0.10)',
        'accent-glow':  'rgba(199, 255, 114, 0.22)',
      },
      fontFamily: {
        display:  ['var(--font-syne)', 'system-ui', 'sans-serif'],
        sans:     ['var(--font-inter)', 'system-ui', 'sans-serif'],
        numbers:  ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-dm-mono)', 'monospace'],
      },
      fontSize: {
        // Display
        'display-2xl': ['clamp(3rem, 8vw, 7rem)',    { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-xl':  ['clamp(2.5rem, 6vw, 5rem)',  { lineHeight: '1.0',  letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(2rem, 4vw, 3.5rem)',  { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.25rem)',{ lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        // Number displays
        'stat-xl':     ['clamp(3rem, 6vw, 5rem)',    { lineHeight: '1.0',  letterSpacing: '-0.03em' }],
        'stat-lg':     ['clamp(2rem, 4vw, 3.5rem)',  { lineHeight: '1.0',  letterSpacing: '-0.025em' }],
        'stat-md':     ['clamp(1.5rem, 3vw, 2rem)',  { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':     'spin 8s linear infinite',
        'breathe-in':    'breatheIn 4s ease-in-out',
        'breathe-out':   'breatheOut 6s ease-in-out',
        'fade-up':       'fadeUp 0.5s ease-out',
        'counter-up':    'counterUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        breatheIn: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.15)', opacity: '1' },
        },
        breatheOut: {
          '0%':   { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0.6' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        counterUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 60%)',
        'radial-center': 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-soft':   '0 0 40px rgba(255,255,255,0.04)',
        'glow-medium': '0 0 60px rgba(255,255,255,0.08)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
        'card':        '0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
