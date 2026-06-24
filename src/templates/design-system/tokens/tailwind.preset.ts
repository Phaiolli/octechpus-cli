/**
 * Stratum DS — Tailwind v4 preset
 *
 * Usage in tailwind.config.ts:
 *   import stratum from './tokens/tailwind.preset'
 *   export default { presets: [stratum], content: [...] }
 *
 * Theme switching uses the data attribute, not a class:
 *   <html data-stratum-theme="dark" data-accent="blue">
 *
 * All color values point to CSS variables defined in tokens.css — that's
 * what makes dark/light/accent toggles instant and SSR-safe.
 */
import type { Config } from 'tailwindcss'

const stratum = {
  darkMode: ['selector', '[data-stratum-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          elevated: 'var(--bg-elevated)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          hover: 'var(--surface-hover)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          soft: 'var(--primary-soft)',
          fg: 'var(--primary-fg)',
        },
        accent: 'var(--accent)',
        success: {
          DEFAULT: 'var(--success)',
          soft: 'var(--success-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
        info: {
          DEFAULT: 'var(--info)',
          soft: 'var(--info-soft)',
        },
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
          6: 'var(--chart-6)',
          7: 'var(--chart-7)',
          8: 'var(--chart-8)',
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },

      fontSize: {
        display: ['60px', { lineHeight: '64px', letterSpacing: '-0.035em', fontWeight: '600' }],
        h1:      ['40px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '600' }],
        h2:      ['30px', { lineHeight: '36px', letterSpacing: '-0.02em',  fontWeight: '600' }],
        h3:      ['22px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '600' }],
        h4:      ['17px', { lineHeight: '22px', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '26px' }],
        body:    ['14px', { lineHeight: '21px' }],
        small:   ['12px', { lineHeight: '17px' }],
        label:   ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '500' }],
      },

      borderRadius: {
        none: 'var(--radius-none)',
        xs:   'var(--radius-xs)',
        sm:   'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        ring: 'var(--ring)',
      },

      spacing: {
        // Tailwind already covers 1-32; just expose the larger ones by token name
        '4.5': '18px',
      },

      zIndex: {
        base: '0',
        sticky: '10',
        dropdown: '100',
        overlay: '200',
        modal: '300',
        popover: '400',
        toast: '500',
        command: '700',
      },

      transitionDuration: {
        instant: '100ms',
        fast: '160ms',
        DEFAULT: '220ms',
        base: '220ms',
        slow: '320ms',
        slower: '480ms',
      },

      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },

      screens: {
        sm: '360px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
        '2xl': '1920px',
      },
    },
  },
} satisfies Partial<Config>

export default stratum
