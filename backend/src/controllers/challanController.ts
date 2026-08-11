import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ChallanStatus, MovementType } from '../types/enums';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateChallanPDF } from '../services/pdfService';

const prisma = new PrismaClient();

// Helper to auto-generate sequential Challan number (e.g., CHAL-2026-0001)
const generateNextChallanNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.challan.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `CHAL-${currentYear}-${sequence}`;
};

export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  const status = req.query.status as ChallanStatus | undefined;
  const customerId = req.query.customerId as string | undefined;
  const search = (req.query.search as string) || '';

  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }

  if (customerId) {
    whereClause.customerId = customerId;
  }

  if (search) {
    whereClause.OR = [
      { challanNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { businessName: { contains: search } } },
    ];
  }

  const challans = await prisma.challan.findMany({
    where: whereClause,
    include: {
      customer: { select: { id: true, name: true, businessName: true, email: true, mobile: true } },
      createdBy: { select: { id: true, name: true, role: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({
    success: true,
    data: challans,
  });
};

export const getChallanById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true } },
        },
      },
    },
  });

  if (!challan) {
    throw new AppError('Challan not found', 404);
  }

  return res.json({ success: true, data: challan });
};

export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, status = ChallanStatus.DRAFT, items } = req.body;

  if (!customerId) {
    throw new AppError('Customer selection is required.', 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('At least one product item is required in the sales challan.', 400);
  }

  // Validate customer existence
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new AppError('Selected customer does not exist.', 400);
  }

  // Perform database transaction for Challan creation & Atomic Stock reduction if Confirmed
  const createdChallan = await prisma.$transaction(async (tx) => {
    let grandTotalAmount = 0;
    let grandTotalQuantity = 0;

    const itemsToCreate = [];

    // Verify all products, check stock availability, and compile frozen snapshot data
    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity);

      if (!productId || isNaN(qty) || qty <= 0) {
        throw new AppError('Invalid item payload. Product ID and positive integer quantity required.', 400);
      }

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new AppError(`Product with ID '${productId}' not found.`, 404);
      }

      // If status is CONFIRMED, check available stock!
      if (status === ChallanStatus.CONFIRMED) {
        if (product.currentStock < qty) {
          throw new AppError(
            `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Requested: ${qty}, Available stock: ${product.currentStock}. Challan cannot be confirmed.`,
            400
          );
        }
      }

      const subtotal = product.unitPrice * qty;
      grandTotalAmount += subtotal;
      grandTotalQuantity += qty;

      itemsToCreate.push({
        productId: product.id,
        productName: product.name, // Frozen snapshot!
        sku: product.sku,         // Frozen snapshot!
        unitPrice: product.unitPrice, // Frozen snapshot!
        quantity: qty,
        subtotal,
      });
    }

    const challanNumber = await generateNextChallanNumber();

    // Create Challan Record with items
    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId,
        status: status as ChallanStatus,
        totalQuantity: grandTotalQuantity,
        totalAmount: grandTotalAmount,
        createdById: req.user!.id,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    // If CONFIRMED, atomically reduce product stock and record OUT movements
    if (status === ChallanStatus.CONFIRMED) {
      for (const item of itemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: MovementType.OUT,
            reason: `Dispatched via Sales Challan ${challan.challanNumber}`,
            createdById: req.user!.id,
          },
        });
      }
    }

    return challan;
  });

  return res.status(201).json({
    success: true,
    message: `Sales Challan ${createdChallan.challanNumber} created as ${createdChallan.status}`,
    data: createdChallan,
  });
};

export const updateChallanStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !Object.values(ChallanStatus).includes(status as ChallanStatus)) {
    throw new AppError("Invalid status. Must be 'DRAFT', 'CONFIRMED', or 'CANCELLED'.", 400);
  }

  const existingChallan = await prisma.challan.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!existingChallan) {
    throw new AppError('Challan not found', 404);
  }

  if (existingChallan.status === status) {
    return res.json({ success: true, message: `Challan is already in ${status} status.`, data: existingChallan });
  }

  if (existingChallan.status === ChallanStatus.CONFIRMED && status === ChallanStatus.DRAFT) {
    throw new AppError('A confirmed challan cannot be reverted back to Draft.', 400);
  }

  const updatedChallan = await prisma.$transaction(async (tx) => {
    // If transitioning DRAFT -> CONFIRMED
    if (existingChallan.status === ChallanStatus.DRAFT && status === ChallanStatus.CONFIRMED) {
      // Validate stock availability for all items first
      for (const item of existingChallan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new AppError(`Product '${item.productName}' no longer exists.`, 400);
        }
        if (product.currentStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for '${product.name}'. Requested: ${item.quantity}, Current stock: ${product.currentStock}. Stock cannot go negative.`,
            400
          );
        }
      }

      // Deduct stock & create movement logs
      for (const item of existingChallan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: MovementType.OUT,
            reason: `Dispatched via Sales Challan ${existingChallan.challanNumber}`,
            createdById: req.user!.id,
          },
        });
      }
    }

    // Update status
    const challan = await tx.challan.update({
      where: { id },
      data: { status: status as ChallanStatus },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    return challan;
  });

  return res.json({
    success: true,
    message: `Challan status updated to ${status}`,
    data: updatedChallan,
  });
};

export const downloadChallanPDF = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { name: true } },
      items: true,
    },
  });

  if (!challan) {
    throw new AppError('Challan not found', 404);
  }

  const pdfBuffer = await generateChallanPDF({
    challanNumber: challan.challanNumber,
    createdAt: challan.createdAt,
    status: challan.status,
    customerName: challan.customer.name,
    businessName: challan.customer.businessName,
    mobile: challan.customer.mobile,
    email: challan.customer.email,
    address: challan.customer.address,
    gstNumber: challan.customer.gstNumber,
    createdBy: challan.createdBy.name,
    totalQuantity: challan.totalQuantity,
    totalAmount: challan.totalAmount,
    items: challan.items.map((i) => ({
      productName: i.productName,
      sku: i.sku,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${challan.challanNumber}.pdf"`);
  return res.send(pdfBuffer);
};
