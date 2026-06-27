import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  excerpt: z.string().min(10).max(500).trim(),
  content: z.string().min(10),
  published: z.boolean().optional().default(false),
});

export const updatePostSchema = createPostSchema.partial().extend({
  published: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
