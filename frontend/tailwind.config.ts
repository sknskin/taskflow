import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 스티치 디자인 시스템 컬러 (CSS 변수 기반, 다크 모드 자동 전환)
      // Stitch design system colors (CSS variable based, auto dark mode switch)
      colors: {
        // ── 디자인 시스템 토큰 (CSS 변수) ──
        // ── Design system tokens (CSS variables) ──
        primary: 'var(--color-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary': '#ffffff',
        'on-primary-container': '#fdfcff',
        'on-primary-fixed': '#001d37',
        'on-primary-fixed-variant': '#00497e',
        'inverse-primary': '#9fcaff',
        'primary-fixed': '#d2e4ff',
        'primary-fixed-dim': '#9fcaff',

        secondary: 'var(--color-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'secondary-fixed': '#dde2f3',
        'secondary-fixed-dim': '#c1c6d7',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5e6473',
        'on-secondary-fixed': '#161c27',
        'on-secondary-fixed-variant': '#414754',

        tertiary: 'var(--color-tertiary)',
        'tertiary-container': '#00864c',
        'tertiary-fixed': '#88f9b0',
        'tertiary-fixed-dim': '#6bdc96',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#f6fff4',
        'on-tertiary-fixed': '#00210f',
        'on-tertiary-fixed-variant': '#00522c',

        error: 'var(--color-error)',
        'error-container': 'var(--color-error-container)',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        surface: 'var(--color-surface)',
        'surface-bright': '#f7fafc',
        'surface-dim': '#d7dadc',
        'surface-variant': '#e0e3e5',
        'surface-tint': '#0061a5',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',

        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'on-background': '#181c1e',
        background: 'var(--color-background)',

        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',

        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eef1f3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
      },
      // 스티치 디자인 그림자
      // Stitch design ambient shadow
      boxShadow: {
        'task-card': '0px 12px 32px rgba(24, 28, 30, 0.06)',
      },
      // 스티치 디자인 라운딩
      // Stitch design border radius
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
      },
      letterSpacing: {
        'editorial': '-0.02em',
        'label-wide': '0.05em',
        'label-wider': '0.1em',
        'label-widest': '0.2em',
      },
    },
  },
  plugins: [],
};

export default config;
