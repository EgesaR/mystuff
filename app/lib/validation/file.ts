import { z } from "zod";

export const uploadFileSchema = z.object({
  folderId: z.string().uuid().optional(),
});