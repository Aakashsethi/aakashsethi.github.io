import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    cover_image: z.string().optional(),
    cover_image_alt: z.string().optional(),
    image_url: z.string().optional(),
    image_width: z.union([z.string(), z.number()]).optional(),
    image_height: z.union([z.string(), z.number()]).optional(),
    author: z.string().optional(),
    linkedin_url: z.string().optional(),
    read_time: z.union([z.string(), z.number(), z.boolean()]).optional(),
    author_profile: z.boolean().optional(),
    share: z.boolean().optional(),
    layout: z.string().optional(),   // ignored; kept for backwards frontmatter
    permalink: z.string().optional(), // ignored
  }),
});

export const collections = { blog };
