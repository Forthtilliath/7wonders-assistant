import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        wonders: {
          blue: { DEFAULT: '#202f54', dark: '#151e36' },
          yellow: { DEFAULT: '#fde504' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
