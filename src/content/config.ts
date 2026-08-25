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
    linkedin_url: z.string().optional(),
  }),
});

export const collections = { blog };
