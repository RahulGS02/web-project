# 💳 RAJINI PHARMA - Payment & Invoice System Guide

## 📋 Overview

The payment system integrates **Razorpay** (Test Mode) for secure online payments and automated **Excel invoice generation** with GST calculations.

---

## 🎯 Features Implemented

### Payment Gateway
- ✅ Razorpay integration (Test Mode)
- ✅ UPI, Cards, Net Banking support
- ✅ Secure payment verification (HMAC SHA256)
- ✅ Payment status tracking
- ✅ Cash on Delivery option

### Financial Calculations
- ✅ Subtotal calculation
- ✅ GST @ 12% (configurable)
- ✅ Platform Fee @ 1% (configurable)
- ✅ Total amount with all taxes

### Invoice System
- ✅ Professional Excel invoices
- ✅ Company branding and GST details
- ✅ Itemized billing with tax breakdown
- ✅ Automatic invoice generation
- ✅ Download functionality

### Admin Features
- ✅ Finance dashboard
- ✅ Payment logs and tracking
- ✅ Revenue analytics
- ✅ GST collection reports

---

## 🔧 Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install razorpay exceljs
```

### 2. Configure Razorpay

1. **Sign up for Razorpay:**
   - Go to https://razorpay.com
   - Create account (Test Mode is free)

2. **Get API Keys:**
   - Dashboard → Settings → API Keys
   - Generate Test Keys

3. **Update `.env` file:**
```env
# Razorpay Configuration (TEST MODE)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_MODE=test_mode

# Financial Configuration
GST_RATE=0.12
PLATFORM_FEE_RATE=0.01
```

### 3. Company Details

Update in `backend/utils/invoiceGenerator.js`:
```javascript
const COMPANY_INFO = {
  name: 'RAJINI PHARMA GENERIC COMMON AND SURGICALS',
  address: 'No. 153/1A1A1, Ground Floor & First Floor',
  city: 'Periyasavalai Main Road, Anna Nagar',
  location: 'Thirukoilur Town, Thirukoilur Taluk',
  district: 'Kallakurichi District - 605757',
  gstin: 'YOUR_GST_NUMBER', // Add your GST number
  phone: '+91-XXXXXXXXXX',
  email: 'contact@rajinipharma.com'
};
```

---

## 💰 Financial Calculations

### Formula
```
Subtotal = Sum of (Price × Quantity) for all items
GST Amount = Subtotal × 12%
Platform Fee = Subtotal × 1%
Total Amount = Subtotal + GST Amount + Platform Fee
```

### Example
```
Medicine A: ₹100 × 2 = ₹200
Medicine B: ₹50 × 3 = ₹150
-----------------------------------
Subtotal:        ₹350.00
GST (12%):       ₹42.00
Platform Fee:    ₹3.50
-----------------------------------
Total:           ₹395.50
```

---

## 🔄 Payment Flow

### Customer Journey

1. **Browse & Add to Cart**
   - Customer selects medicines
   - Adds to cart

2. **Checkout**
   - Navigate to `/checkout`
   - Enter shipping address
   - Choose payment method:
     - Online Payment (Razorpay)
     - Cash on Delivery

3. **Online Payment Process**
   - Order created in database
   - Razorpay order created
   - Payment widget opens
   - Customer completes payment
   - Payment verified via signature
   - Order status updated to "PAID"

4. **Post-Payment**
   - Redirect to success page
   - Generate invoice
   - Download invoice
   - Email confirmation (future)

### Backend Flow

```
POST /api/orders
  ↓
Create Order in Excel
  ↓
POST /api/payment/create-order
  ↓
Create Razorpay Order
  ↓
Return order_id to frontend
  ↓
Razorpay Widget Opens
  ↓
Customer Pays
  ↓
POST /api/payment/verify
  ↓
Verify Signature (HMAC SHA256)
  ↓
Update Order Status
  ↓
Log Payment in payments.xlsx
  ↓
POST /api/invoice/generate/:orderId
  ↓
Generate Excel Invoice
  ↓
GET /api/invoice/download/:orderId
  ↓
Download Invoice
```

---

## 🧪 Testing

### Test Cards (Razorpay Test Mode)

**Success:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**UPI Success:**
```
UPI ID: success@razorpay
```

**Failure Test:**
```
Card Number: 4111 1111 1111 1234
```

### Test Flow

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Test Payment:**
   - Add medicines to cart
   - Go to checkout
   - Select "Online Payment"
   - Use test card: 4111 1111 1111 1111
   - Complete payment
   - Verify success page
   - Download invoice

---

## 📊 Admin Finance Dashboard

Access: `/admin/finance`

### Features
- Total revenue tracking
- Today's revenue
- Paid vs pending orders
- GST collection summary
- Platform fee summary
- Recent payments table
- Excel export (future)

---

## 📄 Invoice Format

### Excel Structure
- **Header:** Company name, logo, GST details
- **Invoice Info:** Invoice number, date, order ID
- **Customer Info:** Name, email, address
- **Items Table:** Medicine, quantity, price, subtotal
- **Summary:** Subtotal, GST, platform fee, total
- **Footer:** Terms and conditions

### File Naming
```
invoice_<ORDER_ID>.xlsx
```

### Storage
```
backend/invoices/invoice_<ORDER_ID>.xlsx
```

---

## 🔐 Security

### Payment Verification
```javascript
// HMAC SHA256 signature verification
const crypto = require('crypto');
const generated_signature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(order_id + '|' + payment_id)
  .digest('hex');

if (generated_signature === razorpay_signature) {
  // Payment verified
}
```

### Best Practices
- ✅ Never expose KEY_SECRET to frontend
- ✅ Always verify payment on backend
- ✅ Use HTTPS in production
- ✅ Log all transactions
- ✅ Validate amounts server-side

---

## 📁 File Structure

```
backend/
├── controllers/
│   ├── paymentController.js      # Payment logic
│   └── invoiceController.js      # Invoice generation
├── routes/
│   ├── payment.js                # Payment endpoints
│   └── invoice.js                # Invoice endpoints
├── utils/
│   ├── financialCalculator.js   # Tax calculations
│   └── invoiceGenerator.js      # Excel invoice
├── data/
│   └── payments.xlsx             # Payment logs
└── invoices/                     # Generated invoices

frontend/
├── pages/
│   ├── CheckoutWithPayment.jsx  # Enhanced checkout
│   ├── PaymentSuccess.jsx       # Success page
│   ├── Orders.jsx               # With invoice download
│   └── admin/
│       └── FinanceDashboard.jsx # Finance analytics
```

---

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
RAZORPAY_MODE=live_mode
```

### Checklist
- [ ] Switch to Razorpay Live Mode
- [ ] Update company GST number
- [ ] Configure webhook for payment notifications
- [ ] Set up email notifications
- [ ] Enable SSL/HTTPS
- [ ] Test with real small amount
- [ ] Set up payment reconciliation

---

## 📞 Support

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Test Mode: Always free

### Common Issues

**Payment not verifying:**
- Check KEY_SECRET is correct
- Verify signature calculation
- Check server logs

**Invoice not generating:**
- Ensure `exceljs` is installed
- Check file permissions
- Verify order exists

---

**Payment System Ready! 💳**

Test with test cards and deploy when ready!

