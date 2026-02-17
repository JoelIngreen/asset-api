import { getPrisma } from '../core/database.js';
import type { Asset } from '@prisma/client';
import type { AssetCreate } from '../models/asset.js';

/**
 * Create a new asset
 */
export async function createAsset(data: AssetCreate): Promise<Asset> {
  const prisma = getPrisma();

  if (data.parentAsset) {
    const parentExists = await prisma.asset.findUnique({
      where: { prismaId: data.parentAsset }
    });
    if (!parentExists) {
      throw new Error(`Parent asset '${data.parentAsset}' does not exist`);
    }
  }

  try {
    return await prisma.asset.create({
      data: {
        prismaId: data.prismaId,
        assetName: data.assetName ?? null,           
        equipmentType: data.equipmentType ?? null,
        businessUnit: data.businessUnit ?? null,
        parentAsset: data.parentAsset ?? null,
        companyLevel: data.companyLevel ?? null,
        priority: data.priority ?? null,
        equipmentState: data.equipmentState ?? null,
        isLinearAsset: data.isLinearAsset ?? null,
        recordState: data.recordState ?? null,
        customIsTu: data.customIsTu ?? null,
        siteId: data.siteId,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error(`Asset with prismaId '${data.prismaId}' already exists`);
    }
    throw error;
  }
}

/**
 * Upsert asset (create or update)
 */
export async function upsertAsset(data: AssetCreate): Promise<Asset> {
  const prisma = getPrisma();

  if (data.parentAsset) {
    const parentExists = await prisma.asset.findUnique({
      where: { prismaId: data.parentAsset }
    });
    if (!parentExists) {
      throw new Error(`Parent asset '${data.parentAsset}' does not exist`);
    }
  }

  return await prisma.asset.upsert({
    where: { prismaId: data.prismaId },
    create: {
      prismaId: data.prismaId,
      assetName: data.assetName ?? null,
      equipmentType: data.equipmentType ?? null,
      businessUnit: data.businessUnit ?? null,
      parentAsset: data.parentAsset ?? null,
      companyLevel: data.companyLevel ?? null,
      priority: data.priority ?? null,
      equipmentState: data.equipmentState ?? null,
      isLinearAsset: data.isLinearAsset ?? null,
      recordState: data.recordState ?? null,
      customIsTu: data.customIsTu ?? null,
      siteId: data.siteId,
    },
    update: {
      assetName: data.assetName ?? null,
      equipmentType: data.equipmentType ?? null,
      businessUnit: data.businessUnit ?? null,
      parentAsset: data.parentAsset ?? null,
      companyLevel: data.companyLevel ?? null,
      priority: data.priority ?? null,
      equipmentState: data.equipmentState ?? null,
      isLinearAsset: data.isLinearAsset ?? null,
      recordState: data.recordState ?? null,
      customIsTu: data.customIsTu ?? null,
      siteId: data.siteId,
    }
  });
}

/**
 * Get asset by ID
 */
export async function getAsset(assetId: number): Promise<Asset | null> {
  const prisma = getPrisma();
  return await prisma.asset.findUnique({
    where: { id: assetId }
  });
}

/**
 * Get asset by Prisma ID
 */
export async function getAssetByPrismaId(prismaId: string): Promise<Asset | null> {
  const prisma = getPrisma();
  return await prisma.asset.findUnique({
    where: { prismaId }
  });
}

/**
 * Get assets with pagination, filtering, and sorting
 */
export async function getAssets(params: {
  skip?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}): Promise<{ assets: Asset[]; total: number }> {
  const prisma = getPrisma();
  const { skip = 0, limit = 100, sortBy, sortOrder = 'asc', filters = {} } = params;

  // Build where clause
  const where: any = {};
  
  if (filters.siteId) {
    where.siteId = filters.siteId;
  }
  if (filters.assetName) {
    where.assetName = { contains: filters.assetName, mode: 'insensitive' };
  }
  if (filters.equipmentType) {
    where.equipmentType = { contains: filters.equipmentType, mode: 'insensitive' };
  }
  if (filters.businessUnit) {
    where.businessUnit = { contains: filters.businessUnit, mode: 'insensitive' };
  }
  if (filters.equipmentState) {
    where.equipmentState = { contains: filters.equipmentState, mode: 'insensitive' };
  }

  // Build orderBy
  const orderBy: any = sortBy ? { [sortBy]: sortOrder } : { id: 'asc' };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.asset.count({ where })
  ]);

  return { assets, total };
}

/**
 * Get assets by parent Prisma ID
 */
export async function getAssetsByParentPrismaId(parentPrismaId: string): Promise<Asset[]> {
  const prisma = getPrisma();
  return await prisma.asset.findMany({
    where: { parentAsset: parentPrismaId }
  });
}