import { getCollection } from 'astro:content';
import { postUrl } from '../lib/postUrl';

const SITE = 'https://aakashsethi.github.io';

export async function GET() {
  const posts = await getCollection('blog');
  const entries = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => {
      const img = post.data.cover_image || (post.data as any).image_url;
      if (!img) return null;
      const url = `${SITE}${postUrl(post)}`;
      const imgAbs = img.startsWith('http') ? img : `${SITE}${img}`;
      const title = escape(post.data.title);
      const caption = escape(post.data.excerpt || post.data.title);
      return `  <url>
    <loc>${url}</loc>
    <image:image>
      <image:loc>${imgAbs}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`;
    })
    .filter(Boolean)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
