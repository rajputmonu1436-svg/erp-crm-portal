const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb://localhost:27017/mini_erp";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("mini_erp");
    console.log("🌱 Connected to MongoDB successfully. Seeding data...");

    // Clear existing data
    await db.collection("User").deleteMany({});
    await db.collection("Customer").deleteMany({});
    await db.collection("Product").deleteMany({});
    await db.collection("FollowUpNote").deleteMany({});
    await db.collection("StockMovement").deleteMany({});
    await db.collection("Challan").deleteMany({});
    await db.collection("ChallanItem").deleteMany({});

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const salesPassword = await bcrypt.hash('sales123', 10);
    const warehousePassword = await bcrypt.hash('warehouse123', 10);
    const accountsPassword = await bcrypt.hash('accounts123', 10);

    // Create Users
    const adminId = new ObjectId();
    const salesId = new ObjectId();
    const warehouseId = new ObjectId();
    const accountsId = new ObjectId();

    await db.collection("User").insertMany([
      { _id: adminId, name: 'System Admin', email: 'admin@company.com', password: adminPassword, role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
      { _id: salesId, name: 'Sarah Sales', email: 'sales@company.com', password: salesPassword, role: 'SALES', createdAt: new Date(), updatedAt: new Date() },
      { _id: warehouseId, name: 'Wally Warehouse', email: 'warehouse@company.com', password: warehousePassword, role: 'WAREHOUSE', createdAt: new Date(), updatedAt: new Date() },
      { _id: accountsId, name: 'Adam Accounts', email: 'accounts@company.com', password: accountsPassword, role: 'ACCOUNTS', createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✅ Created Users');

    // Create Customers
    const customer1Id = new ObjectId();
    const customer2Id = new ObjectId();

    await db.collection("Customer").insertMany([
      { _id: customer1Id, name: 'Rajesh Kumar', mobile: '+91 9876543210', email: 'rajesh@apexretail.com', businessName: 'Apex Retail Store', gstNumber: '27AAAAA0000A1Z5', type: 'RETAIL', address: 'Sector 18, Noida', status: 'ACTIVE', followUpDate: new Date(), notes: 'Copper Wire restock', createdById: salesId, createdAt: new Date(), updatedAt: new Date() },
      { _id: customer2Id, name: 'Vikram Singh', mobile: '+91 9123456789', email: 'contact@metrodistributors.in', businessName: 'Metro Distributors', type: 'DISTRIBUTOR', address: 'Phase 2, New Delhi', status: 'ACTIVE', notes: 'Key distributor', createdById: salesId, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✅ Created Customers');

    // Create Products
    const prod1Id = new ObjectId();
    const prod2Id = new ObjectId();

    await db.collection("Product").insertMany([
      { _id: prod1Id, name: 'Industrial Grade Steel Bolt', sku: 'PRD-BOLT-01', category: 'Hardware', unitPrice: 15.50, currentStock: 450, minStockAlert: 100, location: 'Rack A-12', createdAt: new Date(), updatedAt: new Date() },
      { _id: prod2Id, name: 'Premium Copper Wire', sku: 'PRD-WIRE-25', category: 'Electrical', unitPrice: 1850.00, currentStock: 85, minStockAlert: 20, location: 'Shelf E-01', createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✅ Created Products');

    console.log('🎉 Seeding to MongoDB Compass completed successfully!');

  } catch (error) {
    console.error("❌ Seeding Error: ", error);
  } finally {
    await client.close();
  }
}
run();
