import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://openwpclub.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: {
    defaultStrategy: 'viewport',
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  experimental: {
    svgo: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
