"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/types/enums");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Clean existing data (skipped for MongoDB single-node to avoid transaction error)
    // await prisma.challanItem.deleteMany();
    // await prisma.challan.deleteMany();
    // await prisma.stockMovement.deleteMany();
    // await prisma.followUpNote.deleteMany();
    // await prisma.customer.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.user.deleteMany();
    // Create Users for each role
    const defaultPassword = await bcryptjs_1.default.hash('password123', 10);
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const salesPassword = await bcryptjs_1.default.hash('sales123', 10);
    const warehousePassword = await bcryptjs_1.default.hash('warehouse123', 10);
    const accountsPassword = await bcryptjs_1.default.hash('accounts123', 10);
    const adminUser = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@company.com',
            password: adminPassword,
            role: enums_1.Role.ADMIN,
        },
    });
    const salesUser = await prisma.user.create({
        data: {
            name: 'Sarah Sales',
            email: 'sales@company.com',
            password: salesPassword,
            role: enums_1.Role.SALES,
        },
    });
    const warehouseUser = await prisma.user.create({
        data: {
            name: 'Wally Warehouse',
            email: 'warehouse@company.com',
            password: warehousePassword,
            role: enums_1.Role.WAREHOUSE,
        },
    });
    const accountsUser = await prisma.user.create({
        data: {
            name: 'Adam Accounts',
            email: 'accounts@company.com',
            password: accountsPassword,
            role: enums_1.Role.ACCOUNTS,
        },
    });
    console.log('✅ Created 4 Role Users (Admin, Sales, Warehouse, Accounts)');
    // Seed Customers
    const customer1 = await prisma.customer.create({
        data: {
            name: 'Rajesh Kumar',
            mobile: '+91 9876543210',
            email: 'rajesh@apexretail.com',
            businessName: 'Apex Retail Store',
            gstNumber: '27AAAAA0000A1Z5',
            type: enums_1.CustomerType.RETAIL,
            address: '102 Commercial Market, Sector 18, Noida, UP',
            status: enums_1.CustomerStatus.ACTIVE,
            followUpDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
            notes: 'Interested in quarterly bulk Copper Wire restock.',
            createdById: salesUser.id,
            followUps: {
                create: [
                    {
                        note: 'Initial call completed. Requested quotation for 50 rolls of copper wire.',
                        createdById: salesUser.id,
                    },
                    {
                        note: 'Sent formal quote via email. Waiting for purchase order confirmation.',
                        createdById: salesUser.id,
                    },
                ],
            },
        },
    });
    const customer2 = await prisma.customer.create({
        data: {
            name: 'Vikram Singh',
            mobile: '+91 9123456789',
            email: 'contact@metrodistributors.in',
            businessName: 'Metro Distributors Pvt Ltd',
            gstNumber: '07BBBBA1111B2Z8',
            type: enums_1.CustomerType.DISTRIBUTOR,
            address: 'Plot 45, Industrial Area Phase 2, New Delhi',
            status: enums_1.CustomerStatus.ACTIVE,
            followUpDate: new Date(Date.now() + 86400000 * 7),
            notes: 'Key distributor in North Region. Priority payment terms 30 days.',
            createdById: salesUser.id,
            followUps: {
                create: [
                    {
                        note: 'Reviewed distributor contract terms. Approved credit limit of 5 Lacs.',
                        createdById: adminUser.id,
                    },
                ],
            },
        },
    });
    const customer3 = await prisma.customer.create({
        data: {
            name: 'Anita Sharma',
            mobile: '+91 9988776655',
            email: 'anita@globalwholesale.com',
            businessName: 'Global Wholesale Hub',
            type: enums_1.CustomerType.WHOLESALE,
            address: '78 Ring Road, Subhash Nagar, Jaipur, Rajasthan',
            status: enums_1.CustomerStatus.LEAD,
            followUpDate: new Date(Date.now() + 86400000 * 1),
            notes: 'New lead from trade expo. Requested product catalog.',
            createdById: salesUser.id,
        },
    });
    console.log('✅ Created initial Customers & Follow-up notes');
    // Seed Products
    const prod1 = await prisma.product.create({
        data: {
            name: 'Industrial Grade Steel Bolt (M12x50)',
            sku: 'PRD-BOLT-01',
            category: 'Hardware & Fasteners',
            unitPrice: 15.50,
            currentStock: 450,
            minStockAlert: 100,
            location: 'Rack A-12',
        },
    });
    const prod2 = await prisma.product.create({
        data: {
            name: 'Heavy Duty Hydraulic Pump Seal',
            sku: 'PRD-SEAL-09',
            category: 'Hydraulics',
            unitPrice: 320.00,
            currentStock: 12, // Low stock warning!
            minStockAlert: 15,
            location: 'Bin B-04',
        },
    });
    const prod3 = await prisma.product.create({
        data: {
            name: 'Premium Copper Wire (100m Roll, 2.5sq mm)',
            sku: 'PRD-WIRE-25',
            category: 'Electrical Supplies',
            unitPrice: 1850.00,
            currentStock: 85,
            minStockAlert: 20,
            location: 'Shelf E-01',
        },
    });
    const prod4 = await prisma.product.create({
        data: {
            name: 'Reinforced Rubber Hose 1 inch (50m)',
            sku: 'PRD-HOSE-10',
            category: 'Industrial Hoses',
            unitPrice: 940.00,
            currentStock: 30,
            minStockAlert: 10,
            location: 'Rack C-08',
        },
    });
    console.log('✅ Created initial Products');
    // Initial Stock Movements (IN)
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: prod1.id,
                quantity: 500,
                type: enums_1.MovementType.IN,
                reason: 'Initial PO Restock from Supplier',
                createdById: warehouseUser.id,
            },
            {
                productId: prod2.id,
                quantity: 20,
                type: enums_1.MovementType.IN,
                reason: 'Supplier shipment received',
                createdById: warehouseUser.id,
            },
            {
                productId: prod3.id,
                quantity: 100,
                type: enums_1.MovementType.IN,
                reason: 'Monthly inventory batch inbound',
                createdById: warehouseUser.id,
            },
            {
                productId: prod4.id,
                quantity: 40,
                type: enums_1.MovementType.IN,
                reason: 'Supplier PO #9021',
                createdById: warehouseUser.id,
            },
        ],
    });
    console.log('✅ Created initial Stock Movements (IN)');
    // Seed Challan 1 (Confirmed)
    const challan1 = await prisma.challan.create({
        data: {
            challanNumber: 'CHAL-2026-0001',
            customerId: customer1.id,
            status: enums_1.ChallanStatus.CONFIRMED,
            totalQuantity: 50,
            totalAmount: 15.50 * 50,
            createdById: salesUser.id,
            items: {
                create: [
                    {
                        productId: prod1.id,
                        productName: prod1.name,
                        sku: prod1.sku,
                        unitPrice: 15.50,
                        quantity: 50,
                        subtotal: 15.50 * 50,
                    },
                ],
            },
        },
    });
    // Record Stock OUT log for confirmed challan
    await prisma.stockMovement.create({
        data: {
            productId: prod1.id,
            quantity: 50,
            type: enums_1.MovementType.OUT,
            reason: `Dispatched via Sales Challan ${challan1.challanNumber}`,
            createdById: salesUser.id,
        },
    });
    // Seed Challan 2 (Draft)
    await prisma.challan.create({
        data: {
            challanNumber: 'CHAL-2026-0002',
            customerId: customer2.id,
            status: enums_1.ChallanStatus.DRAFT,
            totalQuantity: 15,
            totalAmount: (1850.00 * 10) + (320.00 * 5),
            createdById: salesUser.id,
            items: {
                create: [
                    {
                        productId: prod3.id,
                        productName: prod3.name,
                        sku: prod3.sku,
                        unitPrice: 1850.00,
                        quantity: 10,
                        subtotal: 1850.00 * 10,
                    },
                    {
                        productId: prod2.id,
                        productName: prod2.name,
                        sku: prod2.sku,
                        unitPrice: 320.00,
                        quantity: 5,
                        subtotal: 320.00 * 5,
                    },
                ],
            },
        },
    });
    console.log('✅ Created sample Challans (Draft & Confirmed)');
    console.log('🎉 Seeding completed successfully!');
    console.log('\n--- TEST ACCOUNTS ---');
    console.log('Admin:     admin@company.com     / admin123');
    console.log('Sales:     sales@company.com     / sales123');
    console.log('Warehouse: warehouse@company.com / warehouse123');
    console.log('Accounts:  accounts@company.com  / accounts123');
    console.log('---------------------\n');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
