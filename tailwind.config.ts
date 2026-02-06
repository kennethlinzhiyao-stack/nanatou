import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-serif-sc)', 'serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(-3deg) translateX(-2px)' },
          '20%': { transform: 'rotate(3deg) translateX(2px)' },
          '30%': { transform: 'rotate(-2deg) translateX(-1px)' },
          '40%': { transform: 'rotate(2deg) translateX(1px)' },
          '50%': { transform: 'rotate(-1deg)' },
          '60%': { transform: 'rotate(1deg)' },
          '70%': { transform: 'rotate(-0.5deg)' },
          '80%': { transform: 'rotate(0.5deg)' },
          '90%': { transform: 'rotate(0deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slip-emerge': {
          '0%': { transform: 'translateY(0) rotateX(0) scale(0.3)', opacity: '0' },
          '30%': { transform: 'translateY(-80px) rotateX(15deg) scale(0.5)', opacity: '0.7' },
          '60%': { transform: 'translateY(-120px) rotateX(-5deg) scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'translateY(0) rotateX(0) scale(1)', opacity: '1' },
        },
        'smoke': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translateY(-30px) scale(1.15)', opacity: '0.2' },
          '100%': { transform: 'translateY(-60px) scale(1.3)', opacity: '0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(201, 169, 110, 0.15)' },
          '50%': { boxShadow: '0 0 35px rgba(201, 169, 110, 0.3)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.5', textShadow: '0 0 12px rgba(208, 245, 225, 0.2)' },
          '50%': { opacity: '1', textShadow: '0 0 24px rgba(208, 245, 225, 0.5)' },
        },
        'envelope-in': {
          '0%': { transform: 'scale(0.8) rotateY(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shake': 'shake 0.8s cubic-bezier(.36,.07,.19,.97) both',
        'float': 'float 4s ease-in-out infinite',
        'slip-emerge': 'slip-emerge 1.2s cubic-bezier(.34,1.56,.64,1) forwards',
        'smoke': 'smoke 6s ease-out infinite',
        'pulse-gold': 'pulse-gold 3s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'envelope-in': 'envelope-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
