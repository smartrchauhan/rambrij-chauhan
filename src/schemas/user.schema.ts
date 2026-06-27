import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
