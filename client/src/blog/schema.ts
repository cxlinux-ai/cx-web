import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date (YYYY-MM-DD)");

export const PostFrontmatterSchema = z.object({
  title: z.string().max(70, "title must be ≤ 70 chars"),
  description: z
    .string()
    .min(120, "description must be ≥ 120 chars")
    .max(200, "description must be ≤ 200 chars"),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  author: z.string(),
  tags: z.array(z.string()).min(1, "at least 1 tag required").max(5, "max 5 tags"),
  draft: z.boolean().default(true),
  featured: z.boolean().default(false),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  readingTimeMinutes: z.number().positive().optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export interface BlogPost {
  slug: string;
  frontmatter: PostFrontmatter;
  readingTimeMinutes: number;
  wordCount: number;
}
