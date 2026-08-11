import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const ensureSeeded = async () => {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const salesPassword = await bcrypt.hash('sales123', 10);
      const warehousePassword = await bcrypt.hash('warehouse123', 10);
      const accountsPassword = await bcrypt.hash('accounts123', 10);

      const admin = await prisma.user.create({
        data: { name: 'System Admin', email: 'admin@company.com', password: adminPassword, role: 'ADMIN' },
      });
      const sales = await prisma.user.create({
        data: { name: 'Sarah Sales', email: 'sales@company.com', password: salesPassword, role: 'SALES' },
      });
      await prisma.user.create({
        data: { name: 'Wally Warehouse', email: 'warehouse@company.com', password: warehousePassword, role: 'WAREHOUSE' },
      });
      await prisma.user.create({
        data: { name: 'Adam Accounts', email: 'accounts@company.com', password: accountsPassword, role: 'ACCOUNTS' },
      });

      // Seed Initial Customers
      await prisma.customer.create({
        data: {
          name: 'Rajesh Kumar',
          mobile: '+91 9876543210',
          email: 'rajesh@apexretail.com',
          businessName: 'Apex Retail Store',
          gstNumber: '27AAAAA0000A1Z5',
          type: 'RETAIL',
          address: 'Sector 18, Noida, UP',
          status: 'ACTIVE',
          createdById: sales.id,
        },
      });

      // Seed Initial Products
      await prisma.product.create({
        data: {
          name: 'Industrial Grade Steel Bolt',
          sku: 'PRD-BOLT-01',
          category: 'Hardware',
          unitPrice: 15.50,
          currentStock: 450,
          minStockAlert: 100,
          location: 'Rack A-12',
        },
      });
      await prisma.product.create({
        data: {
          name: 'Premium Copper Wire (100m)',
          sku: 'PRD-WIRE-25',
          category: 'Electrical',
          unitPrice: 1850.00,
          currentStock: 85,
          minStockAlert: 20,
          location: 'Shelf E-01',
        },
      });
      console.log('✅ Auto-seeded initial test accounts & sample data');
    }
  } catch (err) {
    console.error('Auto-seed check note:', err);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  await ensureSeeded();
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials. User not found.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials. Password incorrect.', 401);
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  await ensureSeeded();
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'SALES';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole,
    },
  });

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json({ success: true, user });
};

