import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database via Prisma ORM...');

  // Clean existing tables in order due to relations
  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.followUpNote.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash default passwords for test accounts
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  const warehousePassword = await bcrypt.hash('warehouse123', 10);
  const accountsPassword = await bcrypt.hash('accounts123', 10);

  // 1. Create Core Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@company.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sarah Sales',
      email: 'sales@company.com',
      password: salesPassword,
      role: 'SALES',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Wally Warehouse',
      email: 'warehouse@company.com',
      password: warehousePassword,
      role: 'WAREHOUSE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Adam Accounts',
      email: 'accounts@company.com',
      password: accountsPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('✅ Created initial system users (ADMIN, SALES, WAREHOUSE, ACCOUNTS)');

  // 2. Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Kumar',
      mobile: '+91 9876543210',
      email: 'rajesh@apexretail.com',
      businessName: 'Apex Retail Store',
      gstNumber: '27AAAAA0000A1Z5',
      type: 'RETAIL',
      address: 'Sector 18, Noida, UP',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      notes: 'Interested in copper wire bulk order',
      createdById: sales.id,
    },
  });

  await prisma.customer.create({
    data: {
      name: 'Vikram Singh',
      mobile: '+91 9123456789',
      email: 'contact@metrodistributors.in',
      businessName: 'Metro Distributors',
      gstNumber: '07BBBBB1111B2Z3',
      type: 'DISTRIBUTOR',
      address: 'Phase 2, Okhla Industrial Area, New Delhi',
      status: 'ACTIVE',
      notes: 'Key distributor for Northern region',
      createdById: sales.id,
    },
  });

  console.log('✅ Created initial customers');

  // 3. Create FollowUp Notes
  await prisma.followUpNote.create({
    data: {
      customerId: customer1.id,
      note: 'Discussed wholesale pricing tiers for 500m copper wire coil.',
      createdById: sales.id,
    },
  });

  // 4. Create Sample Products
  const prod1 = await prisma.product.create({
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

  const prod2 = await prisma.product.create({
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

  console.log('✅ Created initial inventory products');

  // 5. Create Initial Stock Movements
  await prisma.stockMovement.create({
    data: {
      productId: prod1.id,
      quantity: 500,
      type: 'IN',
      reason: 'Initial stock intake from factory',
      createdById: admin.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: prod2.id,
      quantity: 100,
      type: 'IN',
      reason: 'Batch import from supplier',
      createdById: admin.id,
    },
  });

  console.log('🎉 PostgreSQL database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
