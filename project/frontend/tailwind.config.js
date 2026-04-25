/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from design system
        zhusha: {
          DEFAULT: '#C73E3A',
          light: '#E85D5A',
          dark: '#A0302D',
          50: '#FDF2F2',
          100: '#FCE7E7',
          200: '#F9C5C4',
          300: '#F49E9C',
          400: '#E85D5A',
          500: '#C73E3A',
          600: '#A0302D',
          700: '#7A2624',
          800: '#541A19',
          900: '#2E0E0E',
        },
        shiqing: {
          DEFAULT: '#2E5C8A',
          light: '#4A7CB0',
          dark: '#1E3D5C',
          50: '#EEF4FA',
          100: '#D6E5F2',
          200: '#B0CAE5',
          300: '#8AAFD8',
          400: '#4A7CB0',
          500: '#2E5C8A',
          600: '#1E3D5C',
          700: '#173048',
          800: '#0F2233',
          900: '#08131C',
        },
        tenghuang: {
          DEFAULT: '#F4A442',
          light: '#F7C06A',
          dark: '#D4832A',
          50: '#FDF8E8',
          100: '#FBEFCE',
          200: '#F7E09D',
          300: '#F4D16C',
          400: '#F7C06A',
          500: '#F4A442',
          600: '#D4832A',
          700: '#A36320',
          800: '#724316',
          900: '#41240C',
        },
        // Neutral colors
        xuanzhi: {
          DEFAULT: '#F8F6F1',
          warm: '#F5F2EB',
          dark: '#EDE9E0',
        },
        mohei: {
          DEFAULT: '#1A1A1A',
          light: '#333333',
          dark: '#000000',
        },
        danmo: {
          DEFAULT: '#8C8C8C',
          light: '#E8E4DC',
          dark: '#6B6B6B',
        },
        // Status colors
        zhuqing: {
          DEFAULT: '#5A9A6E',
          light: '#7CB88D',
          dark: '#417852',
        },
        yanzhi: {
          DEFAULT: '#B85450',
          light: '#D17A76',
          dark: '#8F3F3C',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'],
        mono: ['"Noto Sans Mono"', 'monospace'],
      },
      animation: {
        'scroll-unfold': 'scrollUnfold 0.5s ease-out forwards',
        'brush-fade-in': 'brushFadeIn 0.6s ease-out forwards',
        'stamp-drop': 'stampDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'unlock-shine': 'unlockShine 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        scrollUnfold: {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        brushFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        stampDrop: {
          '0%': { transform: 'scale(1.5) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        unlockShine: {
          '0%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
          '100%': { filter: 'brightness(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'paper': '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'paper': '8px',
      },
    },
  },
  plugins: [],
}
