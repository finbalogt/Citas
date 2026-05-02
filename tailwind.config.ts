import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // App (dashboard) colors — dark premium
        app: {
          bg:       '#080810',
          surface:  '#10101c',
          surface2: '#1a1a28',
          border:   'rgba(255,255,255,0.06)',
          accent:   '#7c3aed',
          'accent-light': '#8b5cf6',
          text:     '#f1f5f9',
          muted:    '#64748b',
        },
        // Tenant booking colors — override with CSS vars per tenant
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'tenant-bg': 'var(--color-bg)',
        'tenant-text': 'var(--color-text)',
      },
      borderRadius: {
        tenant: 'var(--border-radius)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config
