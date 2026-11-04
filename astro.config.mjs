import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL in your hosting environment (e.g. Vercel) once the custom domain is live.
const site = process.env.SITE_URL || 'https://asbinnovations.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
