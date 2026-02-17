import { Router } from 'express';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AssetCreateSchema } from '../models/asset.js';
import * as assetService from '../services/asset.service.js';
import * as documentService from '../services/document.service.js';

type PrismaIdParams = { prismaId: string };
type ParentPrismaParams = { parentPrismaId: string };
type AssetIdParams = { assetId: string };

type DocumentQuery = {
  filename?: string;
  metadata_key?: string;
  metadata_value?: string;
};

type AssetDocumentParams = {
  assetId: string;
  docId: string;
};

type AssetsListQuery = {
  skip?: string;
  limit?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  site_id?: string;
  asset_name?: string;
  equipment_type?: string;
  business_unit?: string;
  equipment_state?: string;
};



const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ==================== ASSETS ====================

/**
 * @swagger
 * /assets:
 *   post:
 *     summary: Create a New Asset
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetCreate'
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       400:
 *         description: Invalid request data or referenced entity does not exist
 *       409:
 *         description: Asset already exists
 *       500:
 *         description: Internal server error
 */
router.post('/assets', async (req: Request<any, any, any, AssetsListQuery>, res: Response): Promise<void> => {
  try {
    const validatedData = AssetCreateSchema.parse(req.body);
    const asset = await assetService.createAsset(validatedData);
    res.status(201).json(asset);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        detail: 'Invalid request data', 
        errors: error.issues 
      });
    } else if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ detail: error.message });
      } else if (error.message.includes('does not exist')) {
        res.status(400).json({ detail: error.message });
      } else {
        res.status(500).json({ detail: 'Internal server error' });
      }
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /assets/upsert:
 *   post:
 *     summary: Create or Update an Asset (Upsert)
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetCreate'
 *     responses:
 *       200:
 *         description: Asset created or updated successfully
 *       400:
 *         description: Invalid request data or referenced entity does not exist
 *       500:
 *         description: Internal server error
 */
router.post('/assets/upsert', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = AssetCreateSchema.parse(req.body);
    const asset = await assetService.upsertAsset(validatedData);
    res.json(asset);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        detail: 'Invalid request data', 
        errors: error.issues 
      });
    } else if (error instanceof Error) {
      if (error.message.includes('does not exist')) {
        res.status(400).json({ detail: error.message });
      } else {
        res.status(500).json({ detail: 'Internal server error' });
      }
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: Get Assets with Pagination and Filtering
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: asset_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: equipment_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of assets
 */
router.get('/assets', async (req: Request, res: Response): Promise<void> => {
  try {
    const skip = Number.parseInt(req.query.skip as string ?? '') || 0;
    const limit = Math.min(Number.parseInt(req.query.limit as string ?? '') || 100, 500);
    const sortBy = req.query.sort_by as string | undefined;
    const sortOrder = (req.query.sort_order as 'asc' | 'desc') ?? 'asc';

    const filters: Record<string, any> = {};

    if (req.query.site_id !== undefined) {
      const siteId = Number.parseInt(req.query.site_id as string);
      if (!Number.isNaN(siteId)) filters.siteId = siteId;
    }

    if (req.query.asset_name !== undefined) filters.assetName = req.query.asset_name;
    if (req.query.equipment_type !== undefined) filters.equipmentType = req.query.equipment_type;
    if (req.query.business_unit !== undefined) filters.businessUnit = req.query.business_unit;
    if (req.query.equipment_state !== undefined) filters.equipmentState = req.query.equipment_state;

    const { assets, total } = await assetService.getAssets({
      skip,
      limit,
      sortBy,
      sortOrder,
      filters
    });

    res.json({
      total,
      skip,
      limit,
      items: assets
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});


/**
 * @swagger
 * /assets/{asset_id}:
 *   get:
 *     summary: Get Asset by Internal ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Internal asset ID
 *     responses:
 *       200:
 *         description: Asset found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Invalid asset ID
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/assets/:assetId',
  async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);

      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      res.json(asset);
    } catch (error) {
      console.error('Error getting asset:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /assets/by-prisma-id/{prisma_id}:
 *   get:
 *     summary: Get Asset by Prisma ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: prisma_id
 *         required: true
 *         schema:
 *           type: string
 *         description: External Prisma ID
 *     responses:
 *       200:
 *         description: Asset found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/assets/by-prisma-id/:prismaId',
  async (req: Request<PrismaIdParams>, res: Response): Promise<void> => {
    try {
      const asset = await assetService.getAssetByPrismaId(req.params.prismaId);

      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      res.json(asset);
    } catch (error) {
      console.error('Error getting asset:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /assets/by-parent-prisma-id/{parent_prisma_id}:
 *   get:
 *     summary: Get Child Assets by Parent's Prisma ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: parent_prisma_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent asset's Prisma ID
 *     responses:
 *       200:
 *         description: List of child assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Parent asset not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/assets/by-parent-prisma-id/:parentPrismaId',
  async (req: Request<ParentPrismaParams>, res: Response): Promise<void> => {
    try {
      const { parentPrismaId } = req.params;

      const parentAsset = await assetService.getAssetByPrismaId(parentPrismaId);

      if (!parentAsset) {
        res
          .status(404)
          .json({ detail: `Parent asset with prisma_id '${parentPrismaId}' not found` });
        return;
      }

      const childAssets = await assetService.getAssetsByParentPrismaId(parentPrismaId);
      res.json(childAssets);
    } catch (error) {
      console.error('Error getting child assets:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

// ==================== DOCUMENTS ====================

/**
 * @swagger
 * /assets/{asset_id}/documents:
 *   post:
 *     summary: Upload XML Document to an Asset
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: XML file to upload
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid asset ID, no file uploaded, or non-XML file
 *       404:
 *         description: Asset not found
 *       409:
 *         description: Document already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  '/assets/:assetId/documents',
  upload.single('file'),
  async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ detail: 'No file uploaded' });
        return;
      }

      if (!req.file.originalname.toLowerCase().endsWith('.xml')) {
        res.status(400).json({ detail: 'Only XML files are allowed' });
        return;
      }

      const document = await documentService.createDocument(
        assetId,
        req.file.originalname,
        req.file.buffer
      );

      const result = await documentService.getDocumentWithMetadata(assetId, document.id);
      res.json(result);
    } catch (error) {
      console.error('Error uploading document:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ detail: error.message });
      } else {
        res.status(500).json({ detail: 'Internal server error' });
      }
    }
  }
);

/**
 * @swagger
 * /assets/{asset_id}/documents/upsert:
 *   post:
 *     summary: Create or Update an XML Document for an Asset
 *     description: |
 *       Upsert an XML document for an asset. The document ID is extracted from the XML metadata 
 *       (Identificador field). If a document with that ID already exists for this asset, it will 
 *       be updated. If it doesn't exist, a new document will be created.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: XML file to upload (must contain Identificador in metadata)
 *     responses:
 *       200:
 *         description: Document created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid asset ID, no file uploaded, or non-XML file
 *       404:
 *         description: Asset not found
 *       409:
 *         description: Document ID already exists in a different asset
 *       500:
 *         description: Internal server error
 */
router.post(
  '/assets/:assetId/documents/upsert',
  upload.single('file'),
  async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ detail: 'No file uploaded' });
        return;
      }

      if (!req.file.originalname.toLowerCase().endsWith('.xml')) {
        res.status(400).json({ detail: 'Only XML files are allowed' });
        return;
      }

      // createDocument already handles upsert logic internally:
      // - Extracts Identificador from XML metadata
      // - Checks if document with that ID exists
      // - Updates if exists for same asset, creates if not
      // - Throws error if exists for different asset
      const document = await documentService.createDocument(
        assetId,
        req.file.originalname,
        req.file.buffer
      );

      const result = await documentService.getDocumentWithMetadata(assetId, document.id);
      res.json(result);
    } catch (error) {
      console.error('Error upserting document:', error);
      
      if (error instanceof Error) {
        // Handle case where document exists in different asset
        if (error.message.includes('already exists in asset')) {
          res.status(409).json({ detail: error.message });
          return;
        }
      }
      
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /assets/{asset_id}/documents:
 *   get:
 *     summary: Query Documents for an Asset
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         description: Filter by filename
 *       - in: query
 *         name: metadata_key
 *         schema:
 *           type: string
 *         description: Metadata key to filter by (requires metadata_value)
 *       - in: query
 *         name: metadata_value
 *         schema:
 *           type: string
 *         description: Metadata value to filter by (requires metadata_key)
 *     responses:
 *       200:
 *         description: List of documents with metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid asset ID
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */

router.get(
  '/assets/:assetId/documents',
  async (req: Request<AssetIdParams, any, any, DocumentQuery>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      const filters: Record<string, string> = {};

      if (req.query.filename) {
        filters.file_name = req.query.filename;
      }

      if (req.query.metadata_key && req.query.metadata_value) {
        filters[req.query.metadata_key] = req.query.metadata_value;
      }

      const documents = await documentService.queryDocuments(assetId, filters);

      const documentsWithMetadata = await Promise.all(
        documents.map((doc) => documentService.getDocumentWithMetadata(assetId, doc.id))
      );

      res.json(documentsWithMetadata);
    } catch (error) {
      console.error('Error querying documents:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /assets/{asset_id}/documents/{doc_id}:
 *   get:
 *     summary: Get a Specific Document by its ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *       - in: path
 *         name: doc_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document found with metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid asset ID
 *       404:
 *         description: Asset or document not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/assets/:assetId/documents/:docId',
  async (req: Request<AssetDocumentParams>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      const document = await documentService.getDocumentWithMetadata(
        assetId,
        req.params.docId
      );

      if (!document) {
        res.status(404).json({ detail: 'Document not found' });
        return;
      }

      res.json(document);
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /assets/{asset_id}/documents/{doc_id}:
 *   delete:
 *     summary: Delete a Document from an Asset
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *       - in: path
 *         name: doc_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document deleted successfully
 *       400:
 *         description: Invalid asset ID
 *       404:
 *         description: Asset or document not found
 *       500:
 *         description: Internal server error
 */

router.delete(
  '/assets/:assetId/documents/:docId',
  async (req: Request<AssetDocumentParams>, res: Response): Promise<void> => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);

      if (!Number.isInteger(assetId) || assetId <= 0) {
        res.status(400).json({ detail: 'Invalid asset ID' });
        return;
      }

      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ detail: 'Asset not found' });
        return;
      }

      const deleted = await documentService.deleteDocument(assetId, req.params.docId);

      if (!deleted) {
        res.status(404).json({ detail: 'Document not found' });
        return;
      }

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
);

export default router;