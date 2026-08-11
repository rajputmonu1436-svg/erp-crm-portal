import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerType, CustomerStatus } from '../types/enums';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const type = req.query.type as CustomerType | undefined;
  const status = req.query.status as CustomerStatus | undefined;

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { businessName: { contains: search } },
      { email: { contains: search } },
      { mobile: { contains: search } },
    ];
  }

  if (type) {
    whereClause.type = type;
  }

  if (status) {
    whereClause.status = status;
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where: whereClause }),
    prisma.customer.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { followUps: true, challans: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return res.json({
    success: true,
    data: customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      followUps: {
        include: { createdBy: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
      challans: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  return res.json({ success: true, data: customer });
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;

  if (!name || !mobile || !email || !businessName || !address) {
    throw new AppError('Name, mobile, email, business name, and address are required.', 400);
  }

  const newCustomer = await prisma.customer.create({
    data: {
      name,
      mobile,
      email,
      businessName,
      gstNumber: gstNumber || null,
      type: type || CustomerType.RETAIL,
      address,
      status: status || CustomerStatus.LEAD,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes: notes || null,
      createdById: req.user!.id,
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: newCustomer,
  });
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Customer not found', 404);
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      mobile: mobile ?? existing.mobile,
      email: email ?? existing.email,
      businessName: businessName ?? existing.businessName,
      gstNumber: gstNumber !== undefined ? gstNumber : existing.gstNumber,
      type: type ?? existing.type,
      address: address ?? existing.address,
      status: status ?? existing.status,
      followUpDate: followUpDate ? new Date(followUpDate) : existing.followUpDate,
      notes: notes !== undefined ? notes : existing.notes,
    },
  });

  return res.json({
    success: true,
    message: 'Customer updated successfully',
    data: updatedCustomer,
  });
};

export const addFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { note, followUpDate } = req.body;

  if (!note || !note.trim()) {
    throw new AppError('Follow-up note content is required', 400);
  }

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  const newNote = await prisma.followUpNote.create({
    data: {
      customerId: id,
      note,
      createdById: req.user!.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
    },
  });

  // Optional: update next followUpDate on customer
  if (followUpDate) {
    await prisma.customer.update({
      where: { id },
      data: { followUpDate: new Date(followUpDate) },
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Follow-up note added',
    data: newNote,
  });
};
