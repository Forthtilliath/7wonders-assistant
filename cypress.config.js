import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '8e7reo',

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
