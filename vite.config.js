import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: [
      // Add this for .js files that contain JSX
      'src/**/*.js',
      'src/**/*.jsx',
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src.*\.js$/ }, async (args) => ({
              loader: 'jsx',
            }));
          },
        },
      ],
    },
  },
});
