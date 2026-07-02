import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  excerpt: z.string().min(3).max(500).trim(),
  content: z.string().min(1),
  coverUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  internalLabel: z.string().max(100).optional(),
  published: z.boolean().optional().default(false),
  nextPostId: z.string().nullable().optional(),
  previousPostId: z.string().nullable().optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  published: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
