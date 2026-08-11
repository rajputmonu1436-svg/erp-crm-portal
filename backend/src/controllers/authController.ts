import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const login = async (req: AuthenticatedRequest, res: Response) => {
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

