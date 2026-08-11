# Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study Assignment**  
> Operations Portal built for wholesale/distribution business workflows: Customer CRM, Product Inventory Management, Stock Movement Audit Logging, and Sales Challans with PDF generation.

---

## 🌟 Key Features & Business Logic

### 1. Authentication & Role-Based Access Control (RBAC)
- JWT-Based Authentication with password hashing (`bcryptjs`).
- Role-based permissions across 4 distinct user roles:
  - **Admin**: Complete system access across all modules, stats, and settings.
  - **Sales**: CRM customer management, follow-up logging, sales challan creation, and draft confirmation.
  - **Warehouse**: Stock catalog management, minimum alert tracking, manual stock IN/OUT adjustments, and audit trail viewing.
  - **Accounts**: Sales challan review, financial invoice summaries, and PDF download access.

### 2. Customer CRM Module
- Complete Customer profiles with fields: Name, Mobile, Email, Business Name, GSTIN (optional), Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Follow-up Date, and Notes.
- Search, type filter, status filter, and pagination support.
- Interactive **Customer Detail Page** with a chronological timeline of CRM follow-up activity notes and sales order history.

### 3. Product & Inventory Module
- Catalog management: Product Name, SKU (unique code), Category, Unit Price, Current Stock, Minimum Stock Alert Threshold, Bin/Rack Location.
- Low-stock warning highlights (visual alerts when `currentStock <= minStockAlert`).
- **Stock Movement Log**: Audit trail tracking `Product`, `Quantity Changed`, `Movement Type` (`IN` / `OUT`), `Reason`, `Created By` user, and exact timestamp.
- Manual Stock Adjustment interface (`IN` for supplier restocks, `OUT` for manual removals).

### 4. Sales Challan Module
- Sales workflow: Select customer, add multiple line items with quantities, auto-generate sequential challan numbers (e.g. `CHAL-2026-0001`), and save as `Draft` or `Confirmed`.
- **Atomic Stock Management & Non-Negative Enforcement**:
  - Transitioning a challan to `Confirmed` status automatically deducts inventory stock in a single database transaction and logs `OUT` stock movement records.
  - Returns explicit error (`HTTP 400 Bad Request`) if stock is insufficient for any item. Stock cannot go negative.
- **Product Snapshot Data**:
  - Stores frozen product details (`productName`, `sku`, `unitPrice` at the time of order) in `ChallanItem`, preserving financial accuracy even if product prices or names change later in the catalog.
- **PDF Invoice Export**:
  - Server-side PDF document generator producing printable Sales Challans/Invoices.

---

## 🔑 Test Credentials for All Roles

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Admin** | `admin@company.com` | `admin123` | All modules + Admin stats |
| **Sales** | `sales@company.com` | `sales123` | Customer CRM, Sales Challans, Dashboard |
| **Warehouse** | `warehouse@company.com` | `warehouse123` | Inventory, Stock Adjustments, Movement Logs |
| **Accounts** | `accounts@company.com` | `accounts123` | Sales Challans, Financial Summaries, PDF Export |

> 💡 **Quick Role Switcher**: The UI includes a header bar with one-click test buttons to instantly switch between roles without re-typing credentials!

---

## 🏗️ Architecture & Tech Stack

```
Project mearn/
├── backend/                  # Node.js + Express + TypeScript API Server
│   ├── prisma/
│   │   ├── schema.prisma     # Relational Database Schema (Prisma ORM)
│   │   └── seed.ts           # Seeding script for users, products, customers & challans
│   ├── src/
│   │   ├── controllers/      # Auth, Customer, Product, Stock, Challan, Dashboard
│   │   ├── middleware/       # JWT auth & Role RBAC guards
│   │   ├── services/         # PDF generator & stock transaction logic
│   │   └── index.ts          # Express App listener
│   └── Dockerfile
├── frontend/                 # React (Vite) + TypeScript + React Router v6
│   ├── src/
│   │   ├── components/       # Modern Layout, Header, Sidebar, Badges, Modals
│   │   ├── context/          # AuthContext for state & role switching
│   │   ├── pages/            # Dashboard, CRM, Products, Stock Logs, Challans, Builder
│   │   └── styles/           # CSS design system (Variables, Glassmorphism, Responsive)
│   └── Dockerfile
├── docker-compose.yml        # Docker setup for multi-container deployment
├── postman_collection.json   # Exported Postman REST API Collection
└── README.md
```

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, BcryptJS, PDFKit.
- **Frontend**: React 18, Vite, TypeScript, React Router v6, Lucide Icons, Custom CSS Design System.
- **Database**: PostgreSQL (Prisma ORM with clean UUID primary keys, fully supported locally and via cloud providers like Supabase, Neon, Render Postgres).

---

## 🚀 How to Run Locally

### Option A: Standard Setup (PostgreSQL)

#### 1. Backend Setup
```bash
cd backend
npm install

# Initialize Database Schema & Run PostgreSQL Seeding
npx prisma db push
npm run seed

# Start Backend Dev Server (Runs on http://localhost:5000)
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Frontend Dev Server (Runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

### Option B: 1-Click Docker Setup (Includes PostgreSQL)

Run the entire stack (PostgreSQL 15 Database + Node Backend + React Frontend) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL DB**: `localhost:5432` (`user: postgres`, `password: postgres`, `db: mini_erp`)

---

## 📬 Postman API Collection

Import the included `postman_collection.json` file into Postman.

### Key API Endpoints Overview:

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & get JWT token |
| **Auth** | `POST` | `/api/auth/register` | Create new user account |
| **Auth** | `GET` | `/api/auth/me` | Fetch logged-in user profile |
| **CRM** | `GET` | `/api/customers` | List customers (search, type & status filters) |
| **CRM** | `POST` | `/api/customers` | Add new customer profile |
| **CRM** | `GET` | `/api/customers/:id` | View customer profile & follow-up timeline |
| **CRM** | `POST` | `/api/customers/:id/follow-ups` | Add follow-up note to customer |
| **Inventory**| `GET` | `/api/products` | List catalog products (low stock filter) |
| **Inventory**| `POST` | `/api/products` | Add new product to inventory |
| **Stock** | `GET` | `/api/stock` | Audit trail stock movement logs |
| **Stock** | `POST` | `/api/stock/adjust` | Manual stock IN/OUT adjustment |
| **Challans** | `GET` | `/api/challans` | List sales challans |
| **Challans** | `POST` | `/api/challans` | Create sales challan (Draft or Confirmed) |
| **Challans** | `PUT` | `/api/challans/:id/status` | Update status (Draft -> Confirmed) |
| **Challans** | `GET` | `/api/challans/:id/pdf` | Download official PDF Invoice |
| **Dashboard**| `GET` | `/api/dashboard/stats` | High-level operations KPI metrics |

---

## ☁️ Deployment Instructions

### Free Cloud Deployment Options:
- **Backend API**: Render.com, Railway.app, or Fly.io (Node.js web service).
- **Database**: Supabase, Neon.tech, or Render Postgres.
- **Frontend**: Vercel, Netlify, or Render Static Site.

#### Environment Variables for Deployment:
- `PORT`: `5000`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/mini_erp?schema=public` (or Supabase/Neon connection string)
- `JWT_SECRET`: `your_random_secret_key`
- `JWT_EXPIRES_IN`: `7d`
- `NODE_ENV`: `production`

---

## 📝 Assumptions & Known Limitations

1. **Database Architecture**: PostgreSQL is configured via Prisma ORM with relational UUID primary keys and cascading foreign key constraints.
2. **Currency**: Pricing and totals assume INR (`₹`) formatting.
3. **Stock Dispatches**: Cancelling a confirmed sales challan is restricted by default to preserve audit log consistency; stock restocks can be performed using the Stock Adjustment module.

