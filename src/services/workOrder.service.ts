import { getPrisma } from '../core/database.js';
import type { WorkOrder } from '@prisma/client';
import type { WorkOrderCreate } from '../models/workOrder.js';

/**
 * Create work order
 */
export async function createWorkOrder(
  assetId: number,
  data: WorkOrderCreate
): Promise<WorkOrder> {
  const prisma = getPrisma();

  try {
    return await prisma.workOrder.create({
      data: {
        assetId,
        workOrder: data.workOrder,
        workOrderName: data.workOrderName,
        workOrderSource: data.workOrderSource,
        workOrderDate: data.workOrderDate,
        workOrderState: data.workOrderState,
        workType: data.workType,
        workProcedure: data.workProcedure,
        workShop: data.workShop,
        equipmentType: data.equipmentType,
        businessUnit: data.businessUnit,
        companyLevel: data.companyLevel,
        plannedDate: data.plannedDate,
        minPlannedDate: data.minPlannedDate,
        maxPlannedDate: data.maxPlannedDate,
        plannedDownTime: data.plannedDownTime,
        priority: data.priority,
        supplier: data.supplier,
        closingDate: data.closingDate,
        closed: data.closed,
        requester: data.requester,
        isParentWo: data.isParentWo,
        planningNumber: data.planningNumber,
        isEquipmentPreventive: data.isEquipmentPreventive,
        isSaleInvoiced: data.isSaleInvoiced,
        initialWorkedOutDate: data.initialWorkedOutDate,
        totalOwnLaborAmount: data.totalOwnLaborAmount,
        totalOwnLaborTime: data.totalOwnLaborTime,
        totalSuppliedLaborAmount: data.totalSuppliedLaborAmount,
        totalSuppliedLaborTime: data.totalSuppliedLaborTime,
        totalIssueAmount: data.totalIssueAmount,
        totalExtMatAmount: data.totalExtMatAmount,
        totalChargeAmount: data.totalChargeAmount,
        totalToolAmount: data.totalToolAmount,
        totalToolTime: data.totalToolTime,
        totalDownTime: data.totalDownTime,
        totalDownTimeAmount: data.totalDownTimeAmount,
        flowWoToClosing: data.flowWoToClosing,
        carriedOut: data.carriedOut,
        customServiceAffection: data.customServiceAffection,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error(`Work Order with asset_id '${assetId}' and work_order '${data.workOrder}' already exists`);
    }
    if (error.code === 'P2003') {
      throw new Error(`Asset with id '${assetId}' does not exist`);
    }
    throw error;
  }
}

/**
 * Upsert work order
 */
export async function upsertWorkOrder(
  assetId: number,
  data: WorkOrderCreate
): Promise<WorkOrder> {
  const prisma = getPrisma();

  return await prisma.workOrder.upsert({
    where: {
      assetId_workOrder: {
        assetId,
        workOrder: data.workOrder
      }
    },
    create: {
      assetId,
      workOrder: data.workOrder,
      workOrderName: data.workOrderName,
      workOrderSource: data.workOrderSource,
      workOrderDate: data.workOrderDate,
      workOrderState: data.workOrderState,
      workType: data.workType,
      workProcedure: data.workProcedure,
      workShop: data.workShop,
      equipmentType: data.equipmentType,
      businessUnit: data.businessUnit,
      companyLevel: data.companyLevel,
      plannedDate: data.plannedDate,
      minPlannedDate: data.minPlannedDate,
      maxPlannedDate: data.maxPlannedDate,
      plannedDownTime: data.plannedDownTime,
      priority: data.priority,
      supplier: data.supplier,
      closingDate: data.closingDate,
      closed: data.closed,
      requester: data.requester,
      isParentWo: data.isParentWo,
      planningNumber: data.planningNumber,
      isEquipmentPreventive: data.isEquipmentPreventive,
      isSaleInvoiced: data.isSaleInvoiced,
      initialWorkedOutDate: data.initialWorkedOutDate,
      totalOwnLaborAmount: data.totalOwnLaborAmount,
      totalOwnLaborTime: data.totalOwnLaborTime,
      totalSuppliedLaborAmount: data.totalSuppliedLaborAmount,
      totalSuppliedLaborTime: data.totalSuppliedLaborTime,
      totalIssueAmount: data.totalIssueAmount,
      totalExtMatAmount: data.totalExtMatAmount,
      totalChargeAmount: data.totalChargeAmount,
      totalToolAmount: data.totalToolAmount,
      totalToolTime: data.totalToolTime,
      totalDownTime: data.totalDownTime,
      totalDownTimeAmount: data.totalDownTimeAmount,
      flowWoToClosing: data.flowWoToClosing,
      carriedOut: data.carriedOut,
      customServiceAffection: data.customServiceAffection,
    },
    update: {
      workOrderName: data.workOrderName,
      workOrderSource: data.workOrderSource,
      workOrderDate: data.workOrderDate,
      workOrderState: data.workOrderState,
      workType: data.workType,
      workProcedure: data.workProcedure,
      workShop: data.workShop,
      equipmentType: data.equipmentType,
      businessUnit: data.businessUnit,
      companyLevel: data.companyLevel,
      plannedDate: data.plannedDate,
      minPlannedDate: data.minPlannedDate,
      maxPlannedDate: data.maxPlannedDate,
      plannedDownTime: data.plannedDownTime,
      priority: data.priority,
      supplier: data.supplier,
      closingDate: data.closingDate,
      closed: data.closed,
      requester: data.requester,
      isParentWo: data.isParentWo,
      planningNumber: data.planningNumber,
      isEquipmentPreventive: data.isEquipmentPreventive,
      isSaleInvoiced: data.isSaleInvoiced,
      initialWorkedOutDate: data.initialWorkedOutDate,
      totalOwnLaborAmount: data.totalOwnLaborAmount,
      totalOwnLaborTime: data.totalOwnLaborTime,
      totalSuppliedLaborAmount: data.totalSuppliedLaborAmount,
      totalSuppliedLaborTime: data.totalSuppliedLaborTime,
      totalIssueAmount: data.totalIssueAmount,
      totalExtMatAmount: data.totalExtMatAmount,
      totalChargeAmount: data.totalChargeAmount,
      totalToolAmount: data.totalToolAmount,
      totalToolTime: data.totalToolTime,
      totalDownTime: data.totalDownTime,
      totalDownTimeAmount: data.totalDownTimeAmount,
      flowWoToClosing: data.flowWoToClosing,
      carriedOut: data.carriedOut,
      customServiceAffection: data.customServiceAffection,
    }
  });
}

/**
 * Get work orders by asset
 */
export async function getWorkOrdersByAssetId(
  assetId: number,
  skip: number = 0,
  limit: number = 100
): Promise<WorkOrder[]> {
  const prisma = getPrisma();
  return await prisma.workOrder.findMany({
    where: { assetId },
    skip,
    take: limit,
  });
}

/**
 * Get work order by composite key
 */
export async function getWorkOrder(
  assetId: number,
  workOrderId: number
): Promise<WorkOrder | null> {
  const prisma = getPrisma();
  return await prisma.workOrder.findUnique({
    where: {
      assetId_workOrder: {
        assetId,
        workOrder: workOrderId
      }
    }
  });
}

/**
 * Delete work order
 */
export async function deleteWorkOrder(
  assetId: number,
  workOrderId: number
): Promise<boolean> {
  const prisma = getPrisma();
  
  const workOrder = await prisma.workOrder.findUnique({
    where: {
      assetId_workOrder: {
        assetId,
        workOrder: workOrderId
      }
    }
  });

  if (!workOrder) {
    return false;
  }

  await prisma.workOrder.delete({
    where: {
      assetId_workOrder: {
        assetId,
        workOrder: workOrderId
      }
    }
  });

  return true;
}