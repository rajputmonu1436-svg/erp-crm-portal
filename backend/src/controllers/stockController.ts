import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MovementType } from '../types/enums';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getStockMovements = async (req: AuthenticatedRequest, res: Response) => {
  const productId = req.query.productId as string | undefined;
  const type = req.query.type as MovementType | undefined;
  const search = (req.query.search as string) || '';

  const whereClause: any = {};

  if (productId) {
    whereClause.productId = productId;
  }

  if (type) {
    whereClause.type = type;
  }

  if (search) {
    whereClause.OR = [
      { reason: { contains: search } },
      { product: { name: { contains: search } } },
      { product: { sku: { contains: search } } },
    ];
  }

  const movements = await prisma.stockMovement.findMany({
    where: whereClause,
    include: {
      product: { select: { id: true, name: true, sku: true, category: true } },
      createdBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({
    success: true,
    data: movements,
  });
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity, type, reason } = req.body;

  if (!productId || !quantity || !type || !reason) {
    throw new AppError('Product ID, quantity, movement type (IN/OUT), and reason are required.', 400);
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new AppError('Quantity must be a positive integer.', 400);
  }

  if (type !== 'IN' && type !== 'OUT') {
    throw new AppError("Movement type must be 'IN' or 'OUT'.", 400);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  if (type === 'OUT' && product.currentStock < qty) {
    throw new AppError(
      `Insufficient stock! Requested ${qty} OUT, but product only has ${product.currentStock} in stock. Stock cannot go negative.`,
      400
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const newStockLevel = type === 'IN' ? product.currentStock + qty : product.currentStock - qty;

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStockLevel },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity: qty,
        type: type as MovementType,
        reason,
        createdById: req.user!.id,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    return { updatedProduct, movement };
  });

  return res.status(201).json({
    success: true,
    message: `Stock updated successfully. New level: ${result.updatedProduct.currentStock}`,
    data: result.movement,
  });
};
