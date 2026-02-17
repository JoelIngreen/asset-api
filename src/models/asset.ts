import { z } from 'zod';
import type { Asset as PrismaAsset } from '@prisma/client';

export const AssetCreateSchema = z.object({
  prismaId: z.string().min(1),
  assetName: z.string().optional(),
  equipmentType: z.string().optional(),
  businessUnit: z.string().optional(),
  parentAsset: z.string().optional(),
  companyLevel: z.number().optional(),
  priority: z.number().optional(),
  equipmentState: z.string().optional(),
  isLinearAsset: z.number().optional(),
  recordState: z.string().optional(),
  customIsTu: z.number().optional(),
  siteId: z.number().int()
});

export const AssetResponseSchema = AssetCreateSchema.extend({
  id: z.number().int()
});

export const PaginatedAssetResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(AssetResponseSchema)
});

export type AssetCreate = z.infer<typeof AssetCreateSchema>;
export type AssetResponse = PrismaAsset;
export type PaginatedAssetResponse = z.infer<typeof PaginatedAssetResponseSchema>;