# Mini ERP & CRM Operations Portal - API Documentation

Base URL: `http://localhost:5000/api`

---

## Table of Contents
1. [Overview & Authentication](#overview--authentication)
2. [User & Auth Endpoints](#1-user--authentication)
3. [Customer CRM Endpoints](#2-customer-crm)
4. [Product Inventory Endpoints](#3-product-inventory)
5. [Stock Movements Endpoints](#4-stock-movements)
6. [Sales Delivery Challans Endpoints](#5-sales-delivery-challans)
7. [Dashboard Analytics Endpoints](#6-dashboard-analytics)
8. [Enums & Role-Based Access Control](#7-enums--rbac)

---

## Overview & Authentication

All endpoints except `POST /api/auth/login` require Bearer Token Authentication via standard HTTP Header:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Response Format

Standard Successful JSON Response:
```json
{
  "success": true,
  "message": "Operation description (optional)",
  "data": { ... }
}
```

Standard Error JSON Response:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

## 1. User & Authentication

### `POST /api/auth/login`
Public endpoint to authenticate user and receive JWT token.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ecb8b3b0c82b88300001",
    "name": "System Admin",
    "email": "admin@company.com",
    "role": "ADMIN"
  }
}
```

### `GET /api/auth/me`
Fetch profile details of currently logged-in user.

- **Auth Required**: Yes (Any Role)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": "60d5ecb8b3b0c82b88300001",
    "name": "System Admin",
    "email": "admin@company.com",
    "role": "ADMIN",
    "createdAt": "2026-08-11T10:00:00.000Z"
  }
}
```

---

## 2. Customer CRM

### `GET /api/customers`
Retrieve paginated list of customers with search and filters.

- **Auth Required**: Yes (Any Role)
- **Query Parameters**:
  - `page` *(optional, number, default: 1)*
  - `limit` *(optional, number, default: 10)*
  - `search` *(optional, string)*: Filters by name, businessName, email, mobile
  - `type` *(optional, string)*: `RETAIL` | `WHOLESALE` | `DISTRIBUTOR`
  - `status` *(optional, string)*: `LEAD` | `ACTIVE` | `INACTIVE`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "60d5ecb8b3b0c82b88300002",
      "name": "Rajesh Kumar",
      "mobile": "+91 9876543210",
      "email": "rajesh@apexretail.com",
      "businessName": "Apex Retail Store",
      "gstNumber": "27AAAAA0000A1Z5",
      "type": "RETAIL",
      "address": "Sector 18, Noida",
      "status": "ACTIVE",
      "followUpDate": "2026-08-15T00:00:00.000Z",
      "notes": "Copper Wire restock",
      "createdBy": {
        "id": "60d5ecb8b3b0c82b88300001",
        "name": "Sarah Sales",
        "email": "sales@company.com"
      },
      "_count": {
        "followUps": 3,
        "challans": 2
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### `GET /api/customers/:id`
Get full details of a specific customer including timeline notes and challan history.

- **Auth Required**: Yes (Any Role)
- **Response** (`200 OK`): Includes `createdBy`, `followUps` array, and `challans` array.

### `POST /api/customers`
Create a new customer lead or active account.

- **Auth Required**: Yes (`ADMIN`, `SALES`)
- **Request Body**:
```json
{
  "name": "Rajesh Kumar",
  "mobile": "+91 9876543210",
  "email": "rajesh@apexretail.com",
  "businessName": "Apex Retail Store",
  "gstNumber": "27AAAAA0000A1Z5",
  "type": "RETAIL",
  "address": "Sector 18, Noida",
  "status": "ACTIVE",
  "followUpDate": "2026-08-20T00:00:00.000Z",
  "notes": "Key account requirement"
}
```
- **Response** (`201 Created`)

### `PUT /api/customers/:id`
Update an existing customer.

- **Auth Required**: Yes (`ADMIN`, `SALES`)

### `POST /api/customers/:id/follow-ups`
Add a new follow-up interaction note to a customer profile.

- **Auth Required**: Yes (`ADMIN`, `SALES`)
- **Request Body**:
```json
{
  "note": "Called client regarding payment release.",
  "followUpDate": "2026-08-25T00:00:00.000Z"
}
```
- **Response** (`201 Created`)

---

## 3. Product Inventory

### `GET /api/products`
Fetch product catalog with low stock filtering.

- **Auth Required**: Yes (Any Role)
- **Query Parameters**:
  - `search` *(optional, string)*
  - `category` *(optional, string)*
  - `lowStock` *(optional, boolean)*: Set `true` to return products where `currentStock <= minStockAlert`
- **Response** (`200 OK`): Returns array of product objects.

### `GET /api/products/:id`
Get product details with recent stock movements log.

- **Auth Required**: Yes (Any Role)

### `POST /api/products`
Create a new product catalog item with initial stock log.

- **Auth Required**: Yes (`ADMIN`, `WAREHOUSE`)
- **Request Body**:
```json
{
  "name": "Industrial Grade Steel Bolt",
  "sku": "PRD-BOLT-01",
  "category": "Hardware",
  "unitPrice": 15.50,
  "currentStock": 450,
  "minStockAlert": 100,
  "location": "Rack A-12",
  "imageUrl": "http://example.com/bolt.jpg"
}
```
- **Response** (`201 Created`)

### `PUT /api/products/:id`
Update product pricing, minimum alert threshold, or warehouse rack location.

- **Auth Required**: Yes (`ADMIN`, `WAREHOUSE`)

---

## 4. Stock Movements

### `GET /api/stock`
Retrieve stock movement audit log.

- **Auth Required**: Yes (Any Role)
- **Query Parameters**:
  - `productId` *(optional, string)*
  - `type` *(optional, string)*: `IN` | `OUT`
  - `search` *(optional, string)*

### `POST /api/stock/adjust`
Manually adjust inventory level (Stock Inward / Stock Outward) with mandatory reason.

- **Auth Required**: Yes (`ADMIN`, `WAREHOUSE`)
- **Request Body**:
```json
{
  "productId": "60d5ecb8b3b0c82b88300003",
  "quantity": 50,
  "type": "IN",
  "reason": "Supplier shipment received - Batch #4412"
}
```
- **Response** (`201 Created`)

---

## 5. Sales Delivery Challans

### `GET /api/challans`
Get list of delivery challans.

- **Auth Required**: Yes (Any Role)
- **Query Parameters**:
  - `status` *(optional, string)*: `DRAFT` | `CONFIRMED` | `CANCELLED`
  - `customerId` *(optional, string)*
  - `search` *(optional, string)*

### `GET /api/challans/:id`
Get full details of a delivery challan.

- **Auth Required**: Yes (Any Role)

### `GET /api/challans/:id/pdf`
Generate & download printable PDF document for a Delivery Challan.

- **Auth Required**: Yes (Any Role)
- **Headers Returned**: `Content-Type: application/pdf`

### `POST /api/challans`
Create a new sales delivery challan. If created as `CONFIRMED`, automatically decrements product stock and records `OUT` movements.

- **Auth Required**: Yes (`ADMIN`, `SALES`)
- **Request Body**:
```json
{
  "customerId": "60d5ecb8b3b0c82b88300002",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "60d5ecb8b3b0c82b88300003",
      "quantity": 10
    }
  ]
}
```
- **Response** (`201 Created`)

### `PUT /api/challans/:id/status`
Update status of a delivery challan (`DRAFT` → `CONFIRMED` or `CANCELLED`). Confirming a draft automatically reduces stock.

- **Auth Required**: Yes (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Request Body**:
```json
{
  "status": "CONFIRMED"
}
```

---

## 6. Dashboard Analytics

### `GET /api/dashboard/stats`
Get aggregated CRM, Inventory valuation, Sales revenue, and recent activity metrics.

- **Auth Required**: Yes (Any Role)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "crm": {
      "totalCustomers": 24,
      "leadCustomers": 10,
      "activeCustomers": 14
    },
    "inventory": {
      "totalProducts": 18,
      "lowStockCount": 3,
      "totalStockValuation": 145200.50
    },
    "sales": {
      "totalChallans": 42,
      "draftChallans": 5,
      "confirmedChallansCount": 37,
      "totalConfirmedRevenue": 389500.00
    },
    "recentMovements": [...],
    "recentChallans": [...]
  }
}
```

---

## 7. Enums & RBAC Matrix

### User Roles (`Role`)
- `ADMIN`: Full operational access across CRM, Inventory, Sales, & Stock.
- `SALES`: Customer management, creating/updating sales delivery challans.
- `WAREHOUSE`: Product management, stock adjustments, challan dispatch updates.
- `ACCOUNTS`: Financial oversight, view-only access & challan status verification.

### System Enums
- **CustomerType**: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`
- **CustomerStatus**: `LEAD`, `ACTIVE`, `INACTIVE`
- **MovementType**: `IN`, `OUT`
- **ChallanStatus**: `DRAFT`, `CONFIRMED`, `CANCELLED`
