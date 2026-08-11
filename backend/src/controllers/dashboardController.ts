import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerStatus, ChallanStatus } from '../types/enums';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalCustomers,
    leadCustomers,
    activeCustomers,
    totalProducts,
    allProducts,
    totalChallans,
    confirmedChallans,
    draftChallans,
    recentMovements,
    recentChallans,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: CustomerStatus.LEAD } }),
    prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
    prisma.product.count(),
    prisma.product.findMany({ select: { currentStock: true, unitPrice: true, minStockAlert: true } }),
    prisma.challan.count(),
    prisma.challan.findMany({ where: { status: ChallanStatus.CONFIRMED }, select: { totalAmount: true } }),
    prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
    prisma.stockMovement.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.challan.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, businessName: true } },
      },
    }),
  ]);

  const lowStockCount = allProducts.filter((p) => p.currentStock <= p.minStockAlert).length;
  const totalStockValuation = allProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);
  const totalConfirmedRevenue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);

  return res.json({
    success: true,
    data: {
      crm: {
        totalCustomers,
        leadCustomers,
        activeCustomers,
      },
      inventory: {
        totalProducts,
        lowStockCount,
        totalStockValuation,
      },
      sales: {
        totalChallans,
        draftChallans,
        confirmedChallansCount: confirmedChallans.length,
        totalConfirmedRevenue,
      },
      recentMovements,
      recentChallans,
    },
  });
};
