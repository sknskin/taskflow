import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 스티치 디자인 시스템 컬러
      // Stitch design system colors
      colors: {
        primary: '#005ea1',
        'primary-container': '#2178c3',
        'on-primary': '#ffffff',
        'on-primary-container': '#fdfcff',
        'on-primary-fixed': '#001d37',
        'on-primary-fixed-variant': '#00497e',
        'inverse-primary': '#9fcaff',
        'primary-fixed': '#d2e4ff',
        'primary-fixed-dim': '#9fcaff',

        secondary: '#585e6c',
        'secondary-container': '#dde2f3',
        'secondary-fixed': '#dde2f3',
        'secondary-fixed-dim': '#c1c6d7',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5e6473',
        'on-secondary-fixed': '#161c27',
        'on-secondary-fixed-variant': '#414754',

        tertiary: '#006a3b',
        'tertiary-container': '#00864c',
        'tertiary-fixed': '#88f9b0',
        'tertiary-fixed-dim': '#6bdc96',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#f6fff4',
        'on-tertiary-fixed': '#00210f',
        'on-tertiary-fixed-variant': '#00522c',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        surface: '#f7fafc',
        'surface-bright': '#f7fafc',
        'surface-dim': '#d7dadc',
        'surface-variant': '#e0e3e5',
        'surface-tint': '#0061a5',
        'surface-container': '#ebeef0',
        'surface-container-low': '#f1f4f6',
        'surface-container-high': '#e5e9eb',
        'surface-container-highest': '#e0e3e5',
        'surface-container-lowest': '#ffffff',

        'on-surface': '#181c1e',
        'on-surface-variant': '#414751',
        'on-background': '#181c1e',
        background: '#f7fafc',

        outline: '#717782',
        'outline-variant': '#c0c7d3',

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
