import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      height: {
        section: 'calc(100vh - 4rem)',
      },
      maxWidth: {
        app: '768px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        wonders: {
          blue: {
            light: 'hsl(223 45% 33%)',
            DEFAULT: 'hsl(223 45% 23%)',
            dark: 'hsl(223 45% 15%)',
          },
          yellow: { DEFAULT: '#fde504' },
        },
      },
      boxShadow: {
        bottom: '0 0 6px 1px rgba(255, 255, 255, 0.4)',
        // 'bottom': '0 0 6px 1px rgba(255, 255, 255, 0.1), 0 0 4px 1px rgba(255, 255, 255, 0.06)',
      },
      dropShadow: {
        icon: '3px 5px 2px rgb(0 0 0 / 0.4)',
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
};
export default config;
