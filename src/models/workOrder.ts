import { z } from 'zod';
import type { WorkOrder as PrismaWorkOrder } from '@prisma/client';

export const WorkOrderCreateSchema = z.object({
  workOrder: z.number(),
  workOrderName: z.string().optional(),
  workOrderSource: z.string().optional(),
  workOrderDate: z.coerce.date().optional(),
  workOrderState: z.string().optional(),
  workType: z.string().optional(),
  workProcedure: z.string().optional(),
  workShop: z.string().optional(),
  equipmentType: z.string().optional(),
  businessUnit: z.string().optional(),
  companyLevel: z.number().optional(),
  plannedDate: z.coerce.date().optional(),
  minPlannedDate: z.coerce.date().optional(),
  maxPlannedDate: z.coerce.date().optional(),
  plannedDownTime: z.number().optional(),
  priority: z.number().optional(),
  supplier: z.string().optional(),
  closingDate: z.coerce.date().optional(),
  closed: z.boolean().optional(),
  requester: z.string().optional(),
  isParentWo: z.boolean().optional(),
  planningNumber: z.number().optional(),
  isEquipmentPreventive: z.boolean().optional(),
  isSaleInvoiced: z.boolean().optional(),
  initialWorkedOutDate: z.coerce.date().optional(),
  totalOwnLaborAmount: z.number().optional(),
  totalOwnLaborTime: z.number().optional(),
  totalSuppliedLaborAmount: z.number().optional(),
  totalSuppliedLaborTime: z.number().optional(),
  totalIssueAmount: z.number().optional(),
  totalExtMatAmount: z.number().optional(),
  totalChargeAmount: z.number().optional(),
  totalToolAmount: z.number().optional(),
  totalToolTime: z.number().optional(),
  totalDownTime: z.number().optional(),
  totalDownTimeAmount: z.number().optional(),
  flowWoToClosing: z.number().optional(),
  carriedOut: z.boolean().optional(),
  customServiceAffection: z.number().optional()
});

export type WorkOrderCreate = z.infer<typeof WorkOrderCreateSchema>;
export type WorkOrderResponse = PrismaWorkOrder;