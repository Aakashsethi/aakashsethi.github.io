import type { CollectionEntry } from 'astro:content';

/**
 * Compute the Jekyll-compatible URL for a blog post so existing inbound links
 * (search index, LinkedIn shares, RSS subscribers) keep resolving after the
 * Astro migration.
 *
 * Jekyll's default permalink used here was `/:categories/:year/:month/:day/:title.html`,
 * lowercased on the category segment with spaces preserved (URL-encoded when served).
 */
export function postUrl(post: CollectionEntry<'blog'>): string {
  const d = post.data.date;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const cat = (post.data.categories?.[0] ?? '').toLowerCase();
  const slug = post.slug;
  const prefix = cat ? `/${encodeURI(cat)}` : '';
  return `${prefix}/${yyyy}/${mm}/${dd}/${slug}.html`;
}

/** Filesystem path (unencoded) used by getStaticPaths for the catch-all route. */
export function postPathParam(post: CollectionEntry<'blog'>): string {
  const d = post.data.date;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const cat = (post.data.categories?.[0] ?? '').toLowerCase();
  const slug = post.slug;
  const prefix = cat ? `${cat}/` : '';
  return `${prefix}${yyyy}/${mm}/${dd}/${slug}`;
}
