/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS variables
        'brand-1': 'var(--color-brand-1)',
        'brand-2': 'var(--color-brand-2)',
        'brand-3': 'var(--color-brand-3)',
        'brand-4': 'var(--color-brand-4)',
        'brand-5': 'var(--color-brand-5)',
        
        // Semantic colors using CSS variables
        'success': 'rgb(var(--color-success))',
        'warning': 'rgb(var(--color-warning))',
        'error': 'rgb(var(--color-error))',
        
        // Legacy support for theme
        'color1': 'var(--color-brand-1)',
        'success': 'rgb(var(--color-success))',
        'color2': 'var(--color-brand-2)',
        'color3': 'var(--color-brand-3)',
        'color4': 'var(--color-brand-4)',
        'color5': 'var(--color-brand-5)',

        // Legacy primary/secondary/accent
        'primary': 'var(--color-brand-1)',
        'secondary': 'var(--color-brand-2)',
        'accent': 'var(--color-brand-3)',
      },
      backgroundImage: {
        'element-gradient': 'var(--gradient-element)',
        'brand-gradient': 'linear-gradient(135deg, var(--color-brand-1), var(--color-brand-2))',
        'brand-gradient-reverse': 'linear-gradient(135deg, var(--color-brand-2), var(--color-brand-1))',
        'brand-gradient-multi': 'linear-gradient(135deg, var(--color-brand-1), var(--color-brand-2), var(--color-brand-3))',
        
        // Legacy gradients
        'element-gradient': 'var(--gradient-element)',
      },
      animation: {
        'float-element': 'floatElement 4s ease-in-out infinite',
        'float-element': 'floatElement 4s ease-in-out infinite', // Legacy alias
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
          'from': {
            opacity: '0',
            transform: 'translateY(50px)',
          },
          'to': {
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
      boxShadow: {
        'glow': '0 20px 40px color-mix(in srgb, var(--color-brand-1) 15%, transparent)',
        'glow-brand': '0 20px 40px color-mix(in srgb, var(--color-brand-2) 15%, transparent)',
        'glow-success': '0 20px 40px rgba(var(--color-success), 0.15)',
        'glow-green': '0 20px 40px rgba(var(--color-success), 0.15)', // Legacy alias
        'glow-effect': '0 20px 40px color-mix(in srgb, var(--color-brand-1) 15%, transparent)', // Legacy alias
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}