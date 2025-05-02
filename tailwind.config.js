/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      minHeight: {
        content: 'calc(100vh - 130px)', // ヘッダーとフッターを考慮した高さ
      },
      colors: {
        ivory: {
          50: '#FAFAF9',
          100: '#F8F8F7',
          200: '#F1F1EF',
          300: '#E8E8E4',
          400: '#DEDEDA',
          500: '#CFCFC9',
          600: '#ABABA3',
          700: '#87877C',
          800: '#636359',
          900: '#3F3F39',
          950: '#2B2B26',
        },
        indigo: {
          50: '#E0E7FF',
          100: '#C7D2FE',
          200: '#A5B4FC',
          300: '#818CF8',
          400: '#6366F1',
          500: '#4C6EF5', // メインアクセントカラー
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#23215B',
          950: '#16154A',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // サブテキスト
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#86EFAC', // 成功通知
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#166534', // 成功テキスト
          800: '#14532D',
          900: '#052E16',
          950: '#051C11',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D', // 警告
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#7C5F0E', // 警告テキスト
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },

        // Tailwindのデフォルト互換設定
        border: '#E2E8F0', // slate.200
        input: '#F8FAFC', // slate.50
        ring: '#4C6EF5', // indigo.500
        background: '#FAFAF9', // ivory.50
        foreground: '#333333', // カスタム濃いグレー

        primary: {
          DEFAULT: '#4C6EF5', // indigo.500
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F1F5F9', // slate.100
          foreground: '#64748B', // slate.500
        },
        destructive: {
          DEFAULT: '#FCD34D', // warning.300
          foreground: '#7C5F0E', // warning.700
        },
        muted: {
          DEFAULT: '#F8F8F7', // ivory.100
          foreground: '#64748B', // slate.500
        },
        accent: {
          DEFAULT: '#E0E7FF', // indigo.50
          foreground: '#4C6EF5', // indigo.500
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#333333',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#333333',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};
