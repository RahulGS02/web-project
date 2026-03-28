# RAJINI PHARMA - API Documentation

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📝 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Current User
```http
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

---

## 💊 Medicine Endpoints

### Get All Medicines
```http
GET /api/medicines
```

**Query Parameters:**
- `category` - Filter by category
- `search` - Search in name/description
- `requires_prescription` - Filter by prescription requirement (true/false)

**Example:**
```http
GET /api/medicines?category=Pain Relief&search=paracetamol
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "medicine_id": "uuid",
      "name": "Paracetamol 500mg",
      "category": "Pain Relief",
      "description": "Effective pain reliever",
      "price": 25,
      "stock_quantity": 500,
      "requires_prescription": false,
      "expiry_date": "2026-12-31",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Medicine
```http
GET /api/medicines/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "medicine_id": "uuid",
    "name": "Paracetamol 500mg",
    ...
  }
}
```

### Create Medicine (Admin Only)
```http
POST /api/medicines
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Paracetamol 500mg",
  "category": "Pain Relief",
  "description": "Effective pain reliever",
  "price": 25,
  "stock_quantity": 500,
  "requires_prescription": false,
  "expiry_date": "2026-12-31"
}
```

### Update Medicine (Admin Only)
```http
PUT /api/medicines/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** Same as create (partial updates allowed)

### Delete Medicine (Admin Only)
```http
DELETE /api/medicines/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

---

## 🛒 Order Endpoints

### Create Order
```http
POST /api/orders
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "medicine_id": "uuid",
      "quantity": 2
    }
  ],
  "shipping_address": "123 Main St, City, State - 123456",
  "payment_method": "cash_on_delivery"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "user_id": "uuid",
    "total_amount": 50,
    "status": "pending",
    "items": [...],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Orders
```http
GET /api/orders
```
**Headers:** `Authorization: Bearer <token>`

Returns all orders for logged-in user (or all orders if admin)

### Get Single Order
```http
GET /api/orders/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update Order Status (Admin Only)
```http
PUT /api/orders/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "processing"
}
```

**Status values:** `pending`, `processing`, `completed`, `cancelled`

---

## 📦 Inventory Endpoints (Admin Only)

### Get Inventory Overview
```http
GET /api/inventory
```
**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMedicines": 50,
    "lowStockCount": 5,
    "outOfStockCount": 2,
    "expiringCount": 3,
    "lowStockMedicines": [...],
    "outOfStockMedicines": [...],
    "expiringMedicines": [...]
  }
}
```

### Import from Excel
```http
POST /api/inventory/import-excel
```
**Headers:** 
- `Authorization: Bearer <admin_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Excel file (.xlsx)

**Response:**
```json
{
  "success": true,
  "message": "Excel import completed",
  "data": {
    "importedCount": 10,
    "updatedCount": 5,
    "totalProcessed": 15,
    "errors": []
  }
}
```

### Export to Excel
```http
GET /api/inventory/export-excel
```
**Headers:** `Authorization: Bearer <admin_token>`

**Response:** Excel file download

---

## 📋 Prescription Endpoints

### Upload Prescription
```http
POST /api/prescriptions/upload
```
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `prescription`: Image/PDF file
- `order_id`: (optional) Related order ID
- `notes`: (optional) Customer notes

### Get Prescriptions
```http
GET /api/prescriptions
```
**Headers:** `Authorization: Bearer <token>`

Returns user's prescriptions (or all if admin)

### Update Prescription Status (Admin Only)
```http
PUT /api/prescriptions/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "approved",
  "admin_notes": "Prescription verified"
}
```

---

## 📊 Analytics Endpoints (Admin Only)

### Dashboard Analytics
```http
GET /api/analytics/dashboard
```
**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMedicines": 50,
      "totalOrders": 100,
      "todayOrders": 5,
      "pendingOrders": 10,
      "totalRevenue": 50000,
      "monthlyRevenue": 15000,
      "customerCount": 25,
      "lowStockCount": 5
    },
    "topSellingMedicines": [...],
    "recentOrders": [...]
  }
}
```

### Sales Report
```http
GET /api/analytics/sales
```
**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)

---

## ❌ Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Medicines
```bash
curl http://localhost:5000/api/medicines
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"medicine_id":"MEDICINE_ID","quantity":2}],"shipping_address":"Test Address"}'
```

---

## 💳 Payment Endpoints

### Create Razorpay Order
```http
POST /api/payment/create-order
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "order_id": "uuid-of-order"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_xxx",
    "amount": 395.50,
    "currency": "INR",
    "key_id": "rzp_test_xxx"
  }
}
```

### Verify Payment
```http
POST /api/payment/verify
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "order_id": "uuid-of-order"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment_id": "uuid",
    "order_id": "uuid",
    "amount": 395.50,
    "status": "success"
  }
}
```

### Get Payment Status
```http
GET /api/payment/status/:orderId
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_status": "success",
    "razorpay_payment_id": "pay_xxx",
    "amount": 395.50
  }
}
```

### Get All Payments (Admin Only)
```http
GET /api/payment/all
```
**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "payment_id": "uuid",
      "order_id": "uuid",
      "razorpay_payment_id": "pay_xxx",
      "amount": 395.50,
      "payment_status": "success",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📄 Invoice Endpoints

### Generate Invoice
```http
POST /api/invoice/generate/:orderId
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoice_path": "invoices/invoice_xxx.xlsx"
  }
}
```

### Download Invoice
```http
GET /api/invoice/download/:orderId
```
**Headers:** `Authorization: Bearer <token>`

**Response:** Excel file download

---

**API Version:** 1.0
**Last Updated:** 2024 (Payment System Added)

