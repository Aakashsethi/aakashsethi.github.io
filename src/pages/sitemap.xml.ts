import { getCollection } from 'astro:content';
import { postUrl } from '../lib/postUrl';

const SITE = 'https://aakashsethi.github.io';

const STATIC_PATHS = ['/', '/blog/', '/consulting/', '/privacy/'];

export async function GET() {
  const posts = await getCollection('blog');
  const now = new Date().toISOString();

  const urls: string[] = [];
  for (const p of STATIC_PATHS) {
    urls.push(entry(`${SITE}${p}`, now));
  }
  for (const post of posts) {
    urls.push(entry(`${SITE}${postUrl(post)}`, post.data.date.toISOString()));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}

function entry(loc: string, lastmod: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}
