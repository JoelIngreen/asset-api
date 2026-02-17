import { Router } from 'express';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { WorkOrderCreateSchema } from '../models/workOrder.js';
import * as workOrderService from '../services/workOrder.service.js';
import * as assetService from '../services/asset.service.js';

const router = Router();

type AssetIdParams = {
  assetId: string;
};

type PrismaIdParams = {
  prismaId: string;
};

type WorkOrderParams = {
  assetId: string;
  workOrderId: string;
};

/**
 * @swagger
 * /assets/{asset_id}/work_orders:
 *   post:
 *     summary: Create a Work Order for an Asset
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Work order created
 *       404:
 *         description: Asset not found
 *       409:
 *         description: Work order already exists
 */
router.post('/assets/:assetId/work_orders', async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
  try {
    const assetId = Number.parseInt(req.params.assetId, 10);

    if (Number.isNaN(assetId)) {
      res.status(400).json({ detail: 'Invalid asset ID' });
      return;
    }

    const asset = await assetService.getAsset(assetId);
    if (!asset) {
      res.status(404).json({ detail: 'Asset not found' });
      return;
    }

    const validatedData = WorkOrderCreateSchema.parse(req.body);
    const workOrder = await workOrderService.createWorkOrder(assetId, validatedData);
    
    res.status(201).json(workOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        detail: 'Invalid request data', 
        errors: error.issues 
      });
    } else if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({ detail: error.message });
    } else {
      console.error('Error creating work order:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /assets/by-prisma-id/{prisma_id}/work_orders:
 *   post:
 *     summary: Create a Work Order by Asset's Prisma ID
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: prisma_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Work order created
 *       404:
 *         description: Asset not found
 */
router.post('/assets/by-prisma-id/:prismaId/work_orders', async (req: Request<PrismaIdParams>, res: Response): Promise<void> => {
  try {
    const asset = await assetService.getAssetByPrismaId(req.params.prismaId);
    
    if (!asset) {
      res.status(404).json({ detail: `Asset with prisma_id '${req.params.prismaId}' not found` });
      return;
    }

    const validatedData = WorkOrderCreateSchema.parse(req.body);
    const workOrder = await workOrderService.createWorkOrder(asset.id, validatedData);
    
    res.status(201).json(workOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        detail: 'Invalid request data', 
        errors: error.issues 
      });
    } else if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({ detail: error.message });
    } else {
      console.error('Error creating work order:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /assets/{asset_id}/work_orders/upsert:
 *   post:
 *     summary: Upsert a Work Order for an Asset
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Work order created or updated
 */
router.post('/assets/:assetId/work_orders/upsert', async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
  try {
    const assetId = Number.parseInt(req.params.assetId, 10);

    if (Number.isNaN(assetId)) {
      res.status(400).json({ detail: 'Invalid asset ID' });
      return;
    }

    const asset = await assetService.getAsset(assetId);
    if (!asset) {
      res.status(404).json({ detail: 'Asset not found' });
      return;
    }

    const validatedData = WorkOrderCreateSchema.parse(req.body);
    const workOrder = await workOrderService.upsertWorkOrder(assetId, validatedData);
    
    res.json(workOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ 
        detail: 'Invalid request data', 
        errors: error.issues 
      });
    } else {
      console.error('Error upserting work order:', error);
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /assets/{asset_id}/work_orders:
 *   get:
 *     summary: Get All Work Orders for an Asset
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of work orders
 */
router.get('/assets/:assetId/work_orders', async (req: Request<AssetIdParams>, res: Response): Promise<void> => {
  try {
    const assetId = Number.parseInt(req.params.assetId, 10);

    if (Number.isNaN(assetId)) {
      res.status(400).json({ detail: 'Invalid asset ID' });
      return;
    }

    const asset = await assetService.getAsset(assetId);
    if (!asset) {
      res.status(404).json({ detail: 'Asset not found' });
      return;
    }

    const skipParam = req.query.skip;
    const limitParam = req.query.limit;
    
    const skip = typeof skipParam === 'string' ? Number.parseInt(skipParam, 10) : 0;
    const limit = Math.min(
      typeof limitParam === 'string' ? Number.parseInt(limitParam, 10) : 100,
      1000
    );

    const workOrders = await workOrderService.getWorkOrdersByAssetId(assetId, skip, limit);
    res.json(workOrders);
  } catch (error) {
    console.error('Error getting work orders:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

/**
 * @swagger
 * /assets/{asset_id}/work_orders/{work_order_id}:
 *   get:
 *     summary: Get a Specific Work Order
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: work_order_id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Work order found
 *       404:
 *         description: Work order not found
 */
router.get('/assets/:assetId/work_orders/:workOrderId', async (req: Request<WorkOrderParams>, res: Response): Promise<void> => {
  try {
    const assetId = Number.parseInt(req.params.assetId, 10);
    const workOrderId = Number.parseFloat(req.params.workOrderId);

    if (Number.isNaN(assetId) || Number.isNaN(workOrderId)) {
      res.status(400).json({ detail: 'Invalid ID' });
      return;
    }

    const asset = await assetService.getAsset(assetId);
    if (!asset) {
      res.status(404).json({ detail: 'Asset not found' });
      return;
    }

    const workOrder = await workOrderService.getWorkOrder(assetId, workOrderId);
    
    if (!workOrder) {
      res.status(404).json({ detail: 'Work Order not found' });
      return;
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Error getting work order:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

/**
 * @swagger
 * /assets/{asset_id}/work_orders/{work_order_id}:
 *   delete:
 *     summary: Delete a Specific Work Order
 *     tags: [Work Orders]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: work_order_id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Work order deleted
 *       404:
 *         description: Work order not found
 */
router.delete('/assets/:assetId/work_orders/:workOrderId', async (req: Request<WorkOrderParams>, res: Response): Promise<void> => {
  try {
    const assetId = Number.parseInt(req.params.assetId, 10);
    const workOrderId = Number.parseFloat(req.params.workOrderId);

    if (Number.isNaN(assetId) || Number.isNaN(workOrderId)) {
      res.status(400).json({ detail: 'Invalid ID' });
      return;
    }

    const asset = await assetService.getAsset(assetId);
    if (!asset) {
      res.status(404).json({ detail: 'Asset not found' });
      return;
    }

    const deleted = await workOrderService.deleteWorkOrder(assetId, workOrderId);
    
    if (!deleted) {
      res.status(404).json({ detail: 'Work Order not found' });
      return;
    }

    res.json({ message: 'Work Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting work order:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;