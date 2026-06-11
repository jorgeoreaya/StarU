export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1180px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--sd-border))',
        input: 'hsl(var(--sd-input))',
        ring: 'hsl(var(--sd-ring))',
        background: 'hsl(var(--sd-background))',
        foreground: 'hsl(var(--sd-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--sd-primary))',
          foreground: 'hsl(var(--sd-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--sd-secondary))',
          foreground: 'hsl(var(--sd-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--sd-destructive))',
          foreground: 'hsl(var(--sd-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--sd-muted))',
          foreground: 'hsl(var(--sd-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--sd-accent))',
          foreground: 'hsl(var(--sd-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--sd-popover))',
          foreground: 'hsl(var(--sd-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--sd-card))',
          foreground: 'hsl(var(--sd-card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--sd-radius)',
        md: 'calc(var(--sd-radius) - 2px)',
        sm: 'calc(var(--sd-radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
