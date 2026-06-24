/**
 * Stratum DS — design tokens (TypeScript)
 * Source of truth: tokens/tokens.json
 *
 * Import in JS/TS code for values you can't express via CSS variables
 * (chart libraries that need hex/oklch as JS strings, JS-driven animations,
 * server-rendered email templates, etc.).
 *
 * For styling React components, prefer Tailwind utilities or var(--name)
 * — they pick up theme/accent swaps automatically.
 */

export const tokens = {
  color: {
    surface: {
      base: 'var(--bg-base)',
      elevated: 'var(--bg-elevated)',
      raised: 'var(--surface)',
      raised2: 'var(--surface-2)',
      hover: 'var(--surface-hover)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
      disabled: 'var(--text-disabled)',
    },
    border: {
      subtle: 'var(--border-subtle)',
      default: 'var(--border-default)',
      strong: 'var(--border-strong)',
    },
    brand: {
      primary: 'var(--primary)',
      primaryHover: 'var(--primary-hover)',
      primaryActive: 'var(--primary-active)',
      primarySoft: 'var(--primary-soft)',
      primaryFg: 'var(--primary-fg)',
      accent: 'var(--accent)',
    },
    feedback: {
      success: 'var(--success)',
      successSoft: 'var(--success-soft)',
      warning: 'var(--warning)',
      warningSoft: 'var(--warning-soft)',
      danger: 'var(--danger)',
      dangerSoft: 'var(--danger-soft)',
      info: 'var(--info)',
      infoSoft: 'var(--info-soft)',
    },
    chart: [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
      'var(--chart-6)',
      'var(--chart-7)',
      'var(--chart-8)',
    ] as const,
  },

  space: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  radius: {
    none: '0',
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '999px',
  },

  shadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },

  z: {
    base: 0,
    sticky: 10,
    dropdown: 100,
    overlay: 200,
    modal: 300,
    popover: 400,
    toast: 500,
    command: 700,
  },

  duration: {
    instant: 100,
    fast: 160,
    base: 220,
    slow: 320,
    slower: 480,
  },

  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.5, 1.4, 0.5, 1)',
  },

  breakpoint: {
    sm: 360,
    md: 768,
    lg: 1024,
    xl: 1440,
    '2xl': 1920,
  },
} as const

export type StratumTokens = typeof tokens
