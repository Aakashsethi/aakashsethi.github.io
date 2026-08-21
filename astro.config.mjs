import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://aakashsethi.github.io',
  output: 'static',
  integrations: [react(), mdx()],
  server: { port: 4001, host: '127.0.0.1' },
  vite: {
    // Serve the legacy /data/*.json fetches from public/data at dev-time too.
    resolve: {
      alias: {
        '@components': '/src/components',
      },
    },
  },
});
