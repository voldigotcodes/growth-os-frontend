/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        // Keep existing custom colors for liquid glass theme
        midnight: '#0f172a',
        fog: 'rgba(255, 255, 255, 0.65)',
        // Unified 5-color palette for consistency
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        warning: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Apple semantic colors
        'system-blue': '#007AFF',
        'system-green': '#34C759',
        'system-indigo': '#5856D6',
        'system-orange': '#FF9500',
        'system-pink': '#FF2D92',
        'system-purple': '#AF52DE',
        'system-red': '#FF3B30',
        'system-teal': '#5AC8FA',
        'system-yellow': '#FFCC00',
        // System materials
        'system-background': 'rgba(255, 255, 255, 0.8)',
        'system-secondary-background': 'rgba(242, 242, 247, 0.8)',
        'system-tertiary-background': 'rgba(255, 255, 255, 0.8)',
      },
      backgroundImage: {
        aurora: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.35))',
      },
      borderRadius: {
        // Apple 2025 Liquid Glass concentric radius system
        'xs': '12px',
        'sm': '18px',
        'md': '24px',
        'lg': '32px',
        'xl': '40px',
        '2xl': '48px',
        '3xl': '56px',
      },
      boxShadow: {
        // Keep existing + enhanced Liquid Glass shadow system
        soft: '0 20px 45px rgba(15, 23, 42, 0.35)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-xl': '0 16px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        // Liquid Glass depth system
        'liquid-xs': '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'liquid-sm': '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'liquid-md': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'liquid-lg': '0 16px 48px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'liquid-xl': '0 24px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        // Floating panel shadows
        'float': '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'float-lg': '0 35px 80px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        // Glow effects for interactive elements
        'glow-blue': '0 0 32px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 32px rgba(147, 51, 234, 0.3)',
        'glow-pink': '0 0 32px rgba(236, 72, 153, 0.3)',
        'glow-emerald': '0 0 32px rgba(34, 197, 94, 0.3)',
      },
      dropShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.25)',
        glow: '0 8px 24px rgba(99,102,241,0.35)',
        'glow-pink': '0 8px 24px rgba(244,114,182,0.35)',
        'glow-green': '0 8px 24px rgba(34,197,94,0.35)',
      },
      colors: {
        glassWhite: 'rgba(255,255,255,0.10)',
        glassBlack: 'rgba(0,0,0,0.10)',
      },
      spacing: {
        // Enhanced spacing scale for better visual hierarchy
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      fontSize: {
        // Apple-inspired typography scale
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.005em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
      },
      animation: {
        // Apple-style animations enhanced for Liquid Glass
        'spring-in': 'spring-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'liquid-morph': 'liquid-morph 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'liquid-glow': 'liquid-glow 2s ease-in-out infinite',
        'liquid-flow': 'liquid-flow 3s linear infinite',
        'glass-ripple': 'glass-ripple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        // Apple easing curves
        'apple-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
