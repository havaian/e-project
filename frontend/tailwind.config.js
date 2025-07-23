/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS variables - RGB format for Tailwind
        'brand-1': 'rgb(var(--color-brand-1-rgb) / <alpha-value>)',
        'brand-2': 'rgb(var(--color-brand-2-rgb) / <alpha-value>)',
        'brand-3': 'rgb(var(--color-brand-3-rgb) / <alpha-value>)',
        'brand-4': 'rgb(var(--color-brand-4-rgb) / <alpha-value>)',
        'brand-5': 'rgb(var(--color-brand-5-rgb) / <alpha-value>)',
        'brand-6': 'rgb(var(--color-brand-6-rgb) / <alpha-value>)',
        
        // Semantic colors using CSS variables
        'success': 'rgb(var(--color-success-rgb) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning-rgb) / <alpha-value>)',
        'error': 'rgb(var(--color-error-rgb) / <alpha-value>)',
        
        // Legacy support for theme - RGB format
        'color1': 'rgb(var(--color1-rgb) / <alpha-value>)',
        'color2': 'rgb(var(--color2-rgb) / <alpha-value>)',
        'color3': 'rgb(var(--color3-rgb) / <alpha-value>)',
        'color4': 'rgb(var(--color4-rgb) / <alpha-value>)',
        'color5': 'rgb(var(--color5-rgb) / <alpha-value>)',
        'color6': 'rgb(var(--color6-rgb) / <alpha-value>)',

        // Legacy primary/secondary/accent - use hex directly for these
        'primary': 'var(--color-brand-1)',
        'secondary': 'var(--color-brand-2)',
        'accent': 'var(--color-brand-3)',
      },
      backgroundImage: {
        'element-gradient': 'var(--gradient-element)',
        'brand-gradient': 'linear-gradient(135deg, var(--color-brand-1), var(--color-brand-2))',
        'brand-gradient-reverse': 'linear-gradient(135deg, var(--color-brand-2), var(--color-brand-1))',
        'brand-gradient-multi': 'linear-gradient(135deg, var(--color-brand-1), var(--color-brand-2), var(--color-brand-3))',
      },
      animation: {
        'float-element': 'floatElement 4s ease-in-out infinite',
        'pulse-animation': 'pulse 3s ease-in-out infinite',
        'slide-in': 'slideIn 1.2s ease-out',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
      },
      keyframes: {
        floatElement: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '25%': {
            transform: 'translateY(-10px) rotate(1deg)',
          },
          '50%': {
            transform: 'translateY(-15px) rotate(0deg)',
          },
          '75%': {
            transform: 'translateY(-10px) rotate(-1deg)',
          },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(50px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        heartbeat: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
  plugins: [],
}