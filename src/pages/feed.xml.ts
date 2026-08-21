import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { postUrl } from '../lib/postUrl';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Aakash Sethi — Writing',
    description: 'Technical writing on AI engineering, agentic systems, AWS, fintech, and building a consulting practice.',
    site: context.site ?? 'https://aakashsethi.github.io',
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt || '',
        link: postUrl(post),
        categories: post.data.categories,
      })),
    customData: `<language>en-US</language>`,
  });
}
