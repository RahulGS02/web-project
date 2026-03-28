# 📱 WhatsApp Notification & Invoice Link System - Complete Guide

## 🎯 Overview

Automated WhatsApp notification system that sends order confirmations with secure invoice download links to customers after successful payment.

---

## ✅ Features Implemented

### 1. **WhatsApp Integration** ✅
- Multi-provider support (Meta Cloud API, Twilio, 360dialog)
- Template-based messaging
- Phone number validation and formatting
- Connection testing

### 2. **Secure Invoice Links** ✅
- JWT-based signed URLs
- 24-hour expiration (configurable)
- Token validation on download
- HMAC SHA256 security

### 3. **Notification Logging** ✅
- Excel-based notification logs
- Track sent/failed messages
- Message ID tracking
- Error logging

### 4. **Automated Workflow** ✅
- Triggers on payment success
- Automatic invoice generation
- WhatsApp message sending
- Status logging

---

## 🏗️ Architecture

```
Payment Success
    ↓
Verify Payment (paymentController.js)
    ↓
Generate Invoice (invoiceGenerator.js)
    ↓
Create Secure Link (secureUrlGenerator.js)
    ↓
Send WhatsApp (whatsappService.js)
    ↓
Log Notification (notificationController.js)
```

---

## 📁 Files Created

### Backend Services
```
backend/
├── services/
│   └── whatsappService.js          ✅ WhatsApp API integration
├── utils/
│   └── secureUrlGenerator.js       ✅ Signed URL generation
├── controllers/
│   └── notificationController.js   ✅ Notification management
├── routes/
│   └── notifications.js            ✅ Notification endpoints
└── data/
    └── notifications.xlsx          ✅ Auto-created logs
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

Dependencies are already added to `package.json`:
```bash
cd backend
npm install
```

### Step 2: Choose WhatsApp Provider

#### Option A: Meta Cloud API (Recommended - Free Tier Available)

1. **Create Facebook Business Account**
   - Go to https://business.facebook.com
   - Create a business account

2. **Set Up WhatsApp Business API**
   - Go to https://developers.facebook.com
   - Create a new app → Business → WhatsApp
   - Add WhatsApp product to your app

3. **Get Credentials**
   - Phone Number ID: From WhatsApp → API Setup
   - Access Token: From WhatsApp → API Setup → Temporary Token
   - Business Account ID: From App Settings

4. **Configure `.env`**
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=meta
BASE_URL=http://localhost:5000

WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_API_VERSION=v18.0
```

#### Option B: Twilio (Paid - Easy Setup)

1. **Sign Up**: https://www.twilio.com/try-twilio
2. **Enable WhatsApp**: Console → Messaging → Try it out → Send a WhatsApp message
3. **Get Credentials**:
   - Account SID
   - Auth Token
   - WhatsApp Number

4. **Configure `.env`**
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### Option C: 360dialog (Paid - Enterprise)

1. **Sign Up**: https://www.360dialog.com
2. **Get API Key** from dashboard
3. **Configure `.env`**
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=360dialog

DIALOG360_API_KEY=your_api_key
DIALOG360_PARTNER_ID=your_partner_id
```

### Step 3: Configure Base URL

For production, update:
```env
BASE_URL=https://yourdomain.com
INVOICE_LINK_EXPIRATION_MINUTES=1440
```

---

## 📱 Message Template

The system sends this message format:

```
🏥 *RAJINI PHARMA*

Hello [Customer Name],

✅ Your order has been confirmed!

📦 Order ID: [ORDER123]
💰 Amount Paid: ₹[395.50]

📄 Download your invoice here:
[https://yourdomain.com/invoice/order-id]

Thank you for shopping with RAJINI PHARMA!

---
RAJINI PHARMA GENERIC COMMON AND SURGICALS
Thirukoilur, Kallakurichi - 605757
```

---

## 🧪 Testing

### Test WhatsApp Connection

```bash
# Using cURL
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testPhone": "919876543210"}'
```

### Test Complete Flow

1. **Place Order**: Add medicines to cart and checkout
2. **Make Payment**: Use test card `4111 1111 1111 1111`
3. **Check WhatsApp**: You should receive confirmation message
4. **Click Link**: Download invoice from WhatsApp link
5. **Verify Logs**: Check `/api/notifications/logs` (admin)

---

## 📊 API Endpoints

### Send Order Confirmation
```http
POST /api/notifications/send-order-confirmation
Authorization: Bearer <token>

{
  "orderId": "uuid"
}
```

### Get Notification Logs (Admin)
```http
GET /api/notifications/logs?status=sent&orderId=xxx
Authorization: Bearer <admin_token>
```

### Retry Failed Notification (Admin)
```http
POST /api/notifications/retry/:notificationId
Authorization: Bearer <admin_token>
```

### Test WhatsApp (Admin)
```http
POST /api/notifications/test
Authorization: Bearer <admin_token>

{
  "testPhone": "919876543210"
}
```

### Get Statistics (Admin)
```http
GET /api/notifications/stats
Authorization: Bearer <admin_token>
```

---

## 🔒 Security Features

### 1. **Signed URLs**
- JWT tokens with expiration
- Order ID and User ID validation
- HMAC SHA256 signatures

### 2. **Phone Number Validation**
- International format conversion
- India country code (+91) auto-addition
- Length validation

### 3. **Duplicate Prevention**
- Notification logging
- Status tracking
- Retry mechanism

---

## 📈 Notification Logs

### Excel Schema (`notifications.xlsx`)
```
notification_id     | UUID
order_id            | UUID (FK)
user_id             | UUID (FK)
customer_name       | String
customer_phone      | String
notification_type   | order_confirmation
message_status      | sent/failed
message_id          | Provider message ID
provider            | meta/twilio/360dialog
error_message       | String (if failed)
invoice_link        | Secure URL
created_at          | DateTime
```

---

## 🚨 Troubleshooting

### WhatsApp Message Not Sending

**Check 1: Is WhatsApp Enabled?**
```env
WHATSAPP_ENABLED=true
```

**Check 2: Valid Credentials?**
- Test connection using `/api/notifications/test`
- Check provider dashboard for errors

**Check 3: Phone Number Format**
- Must be in format: `919876543210` (country code + number)
- No spaces, dashes, or special characters

**Check 4: Check Logs**
```bash
# View notification logs
GET /api/notifications/logs
```

### Invoice Link Not Working

**Check 1: Token Expiration**
- Default: 24 hours (1440 minutes)
- Increase in `.env`: `INVOICE_LINK_EXPIRATION_MINUTES=2880`

**Check 2: Base URL**
- Must match your domain
- Update `BASE_URL` in `.env`

**Check 3: Invoice Generated?**
- Check `backend/invoices/` folder
- Manually generate: `POST /api/invoice/generate/:orderId`

---

## 🌐 Production Deployment

### 1. Update Environment Variables
```env
NODE_ENV=production
BASE_URL=https://yourdomain.com
WHATSAPP_ENABLED=true
```

### 2. WhatsApp Business Verification
- For Meta: Complete business verification
- Add payment method
- Request production access

### 3. Message Template Approval
- Submit template for approval (Meta)
- Wait for approval (24-48 hours)
- Use approved template name

### 4. SSL Certificate
- Required for secure invoice links
- Use Let's Encrypt or cloud provider SSL

---

## 💡 Best Practices

### 1. **Rate Limiting**
- Don't send duplicate messages
- Check notification logs before sending
- Implement retry with exponential backoff

### 2. **Error Handling**
- Log all failures
- Provide admin retry option
- Send email fallback if WhatsApp fails

### 3. **Customer Privacy**
- Validate phone numbers
- Don't expose customer data in logs
- Secure invoice links with expiration

### 4. **Monitoring**
- Track delivery rates
- Monitor failed messages
- Set up alerts for high failure rates

---

## 📞 Support & Resources

### Meta Cloud API
- Docs: https://developers.facebook.com/docs/whatsapp
- Support: https://developers.facebook.com/support

### Twilio
- Docs: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com

### 360dialog
- Docs: https://docs.360dialog.com
- Support: support@360dialog.com

---

## ✅ Implementation Checklist

- [x] WhatsApp service created
- [x] Secure URL generator implemented
- [x] Notification controller created
- [x] Routes configured
- [x] Payment integration hook added
- [x] Notification logging system
- [x] Multi-provider support
- [x] Documentation complete

---

**System Ready! 🚀**

Enable WhatsApp notifications by setting `WHATSAPP_ENABLED=true` and configuring your provider credentials.

