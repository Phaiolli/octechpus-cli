/**
 * Tailwind preset — Design System
 * Importar em tailwind.config.js do projeto:
 *   presets: [require('./path/to/tailwind.preset.js')]
 *
 * Pré-requisito: importar tokens.css no entrypoint da aplicação.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          base: 'hsl(var(--bg-base) / <alpha-value>)',
          subtle: 'hsl(var(--bg-subtle) / <alpha-value>)',
          elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
        },

        // Surfaces (glass)
        surface: {
          glass: 'hsl(var(--surface-glass))',
          'glass-hover': 'hsl(var(--surface-glass-hover))',
          'glass-active': 'hsl(var(--surface-glass-active))',
        },

        // Borders
        border: {
          subtle: 'hsl(var(--border-subtle))',
          DEFAULT: 'hsl(var(--border-default))',
          strong: 'hsl(var(--border-strong))',
        },

        // Text
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
          disabled: 'hsl(var(--text-disabled))',
          inverse: 'hsl(var(--text-inverse) / <alpha-value>)',
        },

        // Brand
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          hover: 'hsl(var(--accent-hover) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
          soft: 'hsl(var(--accent-soft))',
        },
        'accent-2': {
          DEFAULT: 'hsl(var(--accent-2) / <alpha-value>)',
          soft: 'hsl(var(--accent-2-soft))',
        },

        // Semantic
        success: {
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          soft: 'hsl(var(--success-soft))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          soft: 'hsl(var(--warning-soft))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          soft: 'hsl(var(--danger-soft))',
        },
        info: {
          DEFAULT: 'hsl(var(--info) / <alpha-value>)',
          soft: 'hsl(var(--info-soft))',
        },

        ring: 'hsl(var(--ring) / <alpha-value>)',
      },

      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },

      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-snug)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-snug)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        md: ['var(--text-md)', { lineHeight: 'var(--leading-normal)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-normal)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-snug)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
      },

      letterSpacing: {
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
      },

      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },

      backdropBlur: {
        sm: 'var(--blur-sm)',
        md: 'var(--blur-md)',
        lg: 'var(--blur-lg)',
      },

      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },

      transitionTimingFunction: {
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },

      spacing: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
        topbar: 'var(--topbar-height)',
      },

      maxWidth: {
        content: 'var(--content-max-width)',
      },

      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
      },

      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, hsl(var(--accent-gradient-from)), hsl(var(--accent-gradient-to)))',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
