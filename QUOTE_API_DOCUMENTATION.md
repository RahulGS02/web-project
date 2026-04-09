# 📚 Quote System API Documentation

## Base URL
```
Local: http://localhost:5000/api
Production: https://web-project-lr9c.onrender.com/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔷 Customer Endpoints

### 1. Create Quote Request
**POST** `/quotes/request`

Submit a new quote request with items.

**Request Body:**
```json
{
  "items": [
    {
      "medicine_id": "489369ab-0f7f-4bfd-a669-4896f65e83c8",
      "quantity": 2,
      "customer_notes": "Need urgently"
    },
    {
      "medicine_id": "61b93d7b-2a7e-4f90-a3d2-7e9f1e3a5b8c",
      "quantity": 5,
      "customer_notes": "Prefer brand X"
    }
  ],
  "customer_notes": "Please provide best price for bulk order",
  "shipping_address": "",
  "prescription_ids": []
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Quote request submitted successfully. Admin will review and send you a quote.",
  "data": {
    "order_id": "a2b3c4d5-...",
    "quote_status": "QUOTE_REQUESTED",
    "items_count": 2,
    "estimated_response_time": "24 hours"
  }
}
```

---

### 2. Get My Quotes
**GET** `/quotes/my-quotes`

Get all quote requests for logged-in customer.

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "order_id": "a2b3c4d5-...",
      "user_id": "user123",
      "quote_status": "QUOTE_SENT",
      "quote_version": 1,
      "total_amount": 1478.50,
      "quote_valid_until": "2026-03-15T18:00:00.000Z",
      "customer_notes": "Bulk order",
      "admin_notes": "Discount applied",
      "created_at": "2026-03-13T10:00:00.000Z",
      "quote_sent_at": "2026-03-13T14:00:00.000Z",
      "items": [
        {
          "order_item_id": "item123",
          "medicine_name": "Paracetamol 500mg",
          "quantity": 10,
          "admin_set_price": 25,
          "subtotal": 250,
          "customer_notes": "Need urgently",
          "admin_notes": "Bulk price applied"
        }
      ]
    }
  ]
}
```

---

### 3. Accept Quote
**POST** `/quotes/:orderId/accept`

Accept a quote and proceed to payment.

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Quote accepted. Proceed to payment.",
  "data": {
    "order_id": "a2b3c4d5-...",
    "quote_status": "QUOTE_ACCEPTED",
    "total_amount": 1478.50,
    "payment_url": "/checkout/payment/a2b3c4d5-..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Quote has expired. Please request a new quote."
}
```

---

### 4. Modify Quote
**POST** `/quotes/:orderId/modify`

Modify an existing quote request.

**Request Body:**
```json
{
  "items": [
    {
      "order_item_id": "item123",
      "quantity": 15,
      "customer_notes": "Changed to 15 units"
    }
  ],
  "customer_notes": "Can you give better price for 15 units?"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Quote modification sent to admin for review",
  "data": {
    "order_id": "a2b3c4d5-...",
    "quote_status": "QUOTE_MODIFIED",
    "quote_version": 2
  }
}
```

---

### 5. Reject Quote
**POST** `/quotes/:orderId/reject`

Reject a quote.

**Request Body:**
```json
{
  "reason": "Price too high"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Quote rejected successfully",
  "data": {
    "order_id": "a2b3c4d5-...",
    "quote_status": "QUOTE_REJECTED"
  }
}
```

---

## 🔶 Admin Endpoints

### 6. Get Quote Requests
**GET** `/quotes/requests?status=QUOTE_REQUESTED`

Get all quote requests (admin only).

**Query Parameters:**
- `status` (optional): Filter by quote_status

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "order_id": "a2b3c4d5-...",
      "user_id": "user123",
      "quote_status": "QUOTE_REQUESTED",
      "customer_notes": "Need urgently",
      "created_at": "2026-03-13T10:00:00.000Z",
      "items": [...]
    }
  ]
}
```

---

### 7. Set Prices (Admin)
**POST** `/quotes/:orderId/set-prices`

Admin sets prices for quote items.

**Request Body:**
```json
{
  "items": [
    {
      "order_item_id": "item123",
      "admin_set_price": 22.50,
      "discount_percent": 10,
      "admin_notes": "Bulk discount applied"
    },
    {
      "order_item_id": "item456",
      "admin_set_price": 48.00,
      "discount_percent": 0,
      "admin_notes": ""
    }
  ],
  "delivery_charges": 50,
  "admin_notes": "Special pricing for bulk order. Valid for 48 hours.",
  "quote_valid_hours": 48
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Quote sent to customer successfully",
  "data": {
    "order_id": "a2b3c4d5-...",
    "quote_status": "QUOTE_SENT",
    "total_amount": 1478.50,
    "quote_valid_until": "2026-03-15T18:00:00.000Z"
  }
}
```

---

## 🔷 Shared Endpoints (Customer & Admin)

### 8. Send Negotiation Message
**POST** `/quotes/:orderId/negotiate`

Send a message in quote negotiation.

**Request Body:**
```json
{
  "message": "Can you reduce the price to ₹1200?",
  "attachments": []
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "negotiation_id": "msg123",
    "order_id": "a2b3c4d5-...",
    "user_id": "user123",
    "role": "CUSTOMER",
    "message": "Can you reduce the price to ₹1200?",
    "created_at": "2026-03-13T15:00:00.000Z"
  }
}
```

---

### 9. Get Negotiation Messages
**GET** `/quotes/:orderId/negotiations`

Get all messages for a quote.

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "negotiation_id": "msg123",
      "order_id": "a2b3c4d5-...",
      "user_id": "user123",
      "role": "CUSTOMER",
      "message": "Can you reduce the price?",
      "read_at": null,
      "created_at": "2026-03-13T15:00:00.000Z"
    },
    {
      "negotiation_id": "msg124",
      "order_id": "a2b3c4d5-...",
      "user_id": "admin123",
      "role": "ADMIN",
      "message": "Best price already provided",
      "read_at": "2026-03-13T16:00:00.000Z",
      "created_at": "2026-03-13T15:30:00.000Z"
    }
  ]
}
```

---

### 10. Get Quote History
**GET** `/quotes/:orderId/history`

Get version history of a quote.

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "history_id": "hist123",
      "order_id": "a2b3c4d5-...",
      "version": 1,
      "changed_by": "CUSTOMER",
      "changes_description": "Quote request created",
      "total_at_version": 0,
      "created_at": "2026-03-13T10:00:00.000Z"
    },
    {
      "history_id": "hist124",
      "order_id": "a2b3c4d5-...",
      "version": 1,
      "changed_by": "ADMIN",
      "changes_description": "Admin set prices. Total: ₹1478.50",
      "total_at_version": 1478.50,
      "created_at": "2026-03-13T14:00:00.000Z"
    }
  ]
}
```

---

## 📊 Quote Status Values

```
QUOTE_REQUESTED   - Customer submitted, waiting for admin
QUOTE_SENT        - Admin sent quote to customer
QUOTE_ACCEPTED    - Customer accepted quote
QUOTE_REJECTED    - Customer rejected quote
QUOTE_MODIFIED    - Customer modified and resubmitted
NEGOTIATING       - Active negotiation ongoing
FINALIZED         - Quote finalized and paid
```

---

## 🔐 Authorization

- **Customer endpoints:** Require valid customer token
- **Admin endpoints:** Require admin role
- **Shared endpoints:** Check ownership (customer can only access own quotes)

---

## 🎯 Testing with cURL

```bash
# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul30@gmail.com","password":"Admin@123"}' \
  | jq -r '.token')

# Create quote request
curl -X POST http://localhost:5000/api/quotes/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"medicine_id":"489369ab-...","quantity":2}],"customer_notes":"Test"}'

# Get my quotes
curl http://localhost:5000/api/quotes/my-quotes \
  -H "Authorization: Bearer $TOKEN"
```

---

**Happy coding!** 🚀
