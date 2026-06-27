import { z } from "zod";

export const reactionSchema = z.object({
  type: z.enum(["LIKE", "HEART", "INSIGHTFUL", "CELEBRATE"]),
});

export type ReactionInput = z.infer<typeof reactionSchema>;
