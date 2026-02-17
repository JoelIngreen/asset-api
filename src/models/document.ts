import { z } from 'zod';

export const DocumentResponseSchema = z.object({
  id: z.string(),
  assetId: z.number().nullable().optional(),
  fileName: z.string(),
  md5: z.string(),
  storagePath: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  createdAt: z.coerce.date(),  
  updatedAt: z.coerce.date() 
});

export type DocumentResponse = z.infer<typeof DocumentResponseSchema>;
export type DocumentMetadata = Record<string, string>;