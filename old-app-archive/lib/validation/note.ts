import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),

  content: z.string(),

  folderId: z.string().uuid().optional(),
});

export type CreateNoteData = z.infer<typeof createNoteSchema>;
