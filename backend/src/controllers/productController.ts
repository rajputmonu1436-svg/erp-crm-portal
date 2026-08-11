import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  const search = (req.query.search as string) || '';
  const category = (req.query.category as string) || '';
  const lowStockOnly = req.query.lowStock === 'true';

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { category: { contains: search } },
      { location: { contains: search } },
    ];
  }

  if (category) {
    whereClause.category = category;
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
  });

  const filteredProducts = lowStockOnly
    ? products.filter((p) => p.currentStock <= p.minStockAlert)
    : products;

  return res.json({
    success: true,
    data: filteredProducts,
  });
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return res.json({ success: true, data: product });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { name, sku, category, unitPrice, currentStock, minStockAlert, location, imageUrl } = req.body;

  if (!name || !sku || !category || unitPrice === undefined || !location) {
    throw new AppError('Product name, SKU, category, unit price, and location are required.', 400);
  }

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    throw new AppError(`SKU '${sku}' already exists. Please use a unique SKU code.`, 400);
  }

  const initialStock = currentStock ? parseInt(currentStock) : 0;

  const newProduct = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name,
        sku: sku.toUpperCase(),
        category,
        unitPrice: parseFloat(unitPrice),
        currentStock: initialStock,
        minStockAlert: minStockAlert ? parseInt(minStockAlert) : 5,
        location,
        imageUrl: imageUrl || null,
      },
    });

    if (initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: initialStock,
          type: 'IN',
          reason: 'Initial stock setup on creation',
          createdById: req.user!.id,
        },
      });
    }

    return product;
  });

  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct,
  });
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, sku, category, unitPrice, minStockAlert, location, imageUrl } = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  if (sku && sku.toUpperCase() !== existing.sku) {
    const duplicate = await prisma.product.findUnique({ where: { sku: sku.toUpperCase() } });
    if (duplicate) {
      throw new AppError(`SKU '${sku}' is already in use by another product.`, 400);
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      sku: sku ? sku.toUpperCase() : existing.sku,
      category: category ?? existing.category,
      unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
      minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert) : existing.minStockAlert,
      location: location ?? existing.location,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
    },
  });

  return res.json({
    success: true,
    message: 'Product updated successfully',
    data: updated,
  });
};
