import type { APIRoute } from 'astro';

/**
 * robots.txt - generated so the sitemap URL follows SITE_URL.
 * Brochure PDFs are disallowed here AND sent with `X-Robots-Tag: noindex` (see vercel.json / public/_headers).
 */
export const GET: APIRoute = ({ site }) => {
  const base = site ? site.origin : 'https://asbinnovations.com';
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /brochures/',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
