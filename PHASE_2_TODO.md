# 📋 Phase 2: Admin Dashboard & Advanced Features TODO

## 🎯 Overview
Phase 1 (Customer Side) is ✅ **COMPLETE**. Now we need to build the admin dashboard to manage quotes and set prices.

---

## 🔨 Phase 2 Tasks

### **1. Admin Quote Management Dashboard** 
Priority: 🔴 **HIGH**

**Pages to Create:**

#### **A. Quote Requests Dashboard** (`frontend/src/pages/admin/AdminQuotes.jsx`)
- [ ] List all quote requests with filters:
  - Status: QUOTE_REQUESTED, QUOTE_SENT, QUOTE_MODIFIED, etc.
  - Date range
  - Customer name/email
- [ ] Show key information for each request:
  - Customer name
  - Number of items
  - Request date
  - Time since request
  - Status badge
- [ ] Quick actions:
  - "Review & Set Prices" button
  - "View Details" button
  - Mark as urgent/priority
- [ ] Statistics at top:
  - Pending requests count
  - Today's requests
  - Average response time
  - Conversion rate

#### **B. Quote Price Setting Page** (`frontend/src/pages/admin/SetQuotePrices.jsx`)
- [ ] Show customer information
- [ ] Show all items in quote
- [ ] For each item:
  - Medicine name
  - Quantity
  - Catalog price (reference)
  - Last sold price (reference)
  - Customer notes
  - Input field for admin to set price
  - Discount percentage input
  - Admin notes input
  - Option to suggest alternative medicine
- [ ] Price calculation:
  - Subtotal auto-calculated
  - GST auto-calculated
  - Platform fee auto-calculated
  - Delivery charges input
  - Total amount display
- [ ] Quote validity:
  - Input for hours (default: 48)
  - Expiry date/time display
- [ ] Admin notes (global):
  - Text area for general notes
  - Quick templates dropdown
- [ ] Actions:
  - "Send Quote" button
  - "Save Draft" button
  - "Request Clarification" button

#### **C. Quote Detail Page (Admin View)** (`frontend/src/pages/admin/QuoteDetailAdmin.jsx`)
- [ ] Same as customer view but with:
  - Edit prices button
  - View history button
  - Send message button
  - Change status manually
  - View customer profile link

---

### **2. Price Management Features**
Priority: 🟡 **MEDIUM**

#### **A. Price Templates**
- [ ] Save common pricing templates:
  - "Bulk Discount" (10% off)
  - "First Time Customer" (5% off)
  - "Urgent Delivery" (+₹100)
- [ ] Apply template to quote with one click
- [ ] Create/edit/delete templates

#### **B. Price History & Suggestions**
- [ ] Show for each medicine:
  - Last sold price
  - Average price (last 30 days)
  - Highest/lowest sold price
  - Stock status
- [ ] Smart suggestions:
  - "You sold this at ₹50 last time"
  - "Average price: ₹48"
  - "Current market rate: ₹52" (if available)

#### **C. Bulk Actions**
- [ ] Select multiple quote requests
- [ ] Apply same discount to all
- [ ] Set same delivery charge to all
- [ ] Send all at once

---

### **3. Negotiation Chat System**
Priority: 🟡 **MEDIUM**

#### **A. Chat UI Component**
- [ ] Real-time message display
- [ ] Send message input
- [ ] File attachment support
- [ ] Message timestamps
- [ ] Read receipts
- [ ] Unread count indicator

#### **B. Integration**
- [ ] Add chat button in Quote Detail page
- [ ] Modal or side panel for chat
- [ ] Notification when new message arrives
- [ ] Admin can see all conversations

---

### **4. Quote Modification Flow (Customer)**
Priority: 🟡 **MEDIUM**

#### **A. Modify Quote Page** (`frontend/src/pages/ModifyQuote.jsx`)
- [ ] Load current quote items
- [ ] Allow changes:
  - Update quantities
  - Add new items
  - Remove items
  - Update notes
- [ ] Show price comparison:
  - "Before: ₹1,500"
  - "After (estimated): TBD"
- [ ] Resubmit to admin
- [ ] Track modification count

---

### **5. Notifications System**
Priority: 🟠 **LOW-MEDIUM**

#### **A. In-App Notifications**
- [ ] Notification bell icon in header
- [ ] Dropdown showing recent notifications
- [ ] Mark as read
- [ ] Types:
  - Customer: "Admin sent you a quote"
  - Customer: "Your quote expires in 2 hours"
  - Admin: "New quote request from John"
  - Admin: "Customer modified quote #123"

#### **B. Email Notifications** (Optional)
- [ ] Quote request received (to admin)
- [ ] Quote sent (to customer)
- [ ] Quote expiring soon (to customer)
- [ ] Quote accepted (to admin)

#### **C. WhatsApp Notifications** (Optional)
- [ ] Use existing WhatsApp integration
- [ ] Send quote link via WhatsApp
- [ ] Quote status updates

---

### **6. Analytics & Reports**
Priority: 🟢 **LOW**

#### **A. Quote Analytics Dashboard**
- [ ] Total quotes requested
- [ ] Acceptance rate
- [ ] Average response time
- [ ] Average negotiation cycles
- [ ] Revenue from quotes
- [ ] Most modified items
- [ ] Conversion funnel

#### **B. Pricing Analytics**
- [ ] Price trends over time
- [ ] Discount distribution
- [ ] Most profitable items
- [ ] Average order value (quote-based vs regular)

---

### **7. UI/UX Improvements**
Priority: 🟢 **LOW**

#### **A. Loading States**
- [ ] Skeleton loaders
- [ ] Progress indicators
- [ ] Optimistic UI updates

#### **B. Empty States**
- [ ] No quotes found
- [ ] No messages
- [ ] No history

#### **C. Mobile Optimization**
- [ ] Responsive tables
- [ ] Touch-friendly buttons
- [ ] Mobile-first design

#### **D. Accessibility**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support

---

### **8. Advanced Features** (Future)
Priority: 🔵 **NICE TO HAVE**

#### **A. Quote Comparison**
- [ ] Customer can see multiple quotes
- [ ] Side-by-side comparison
- [ ] Highlight differences

#### **B. Quick Re-order**
- [ ] "Order Again" from past quotes
- [ ] Request new quote for same items
- [ ] Apply same notes

#### **C. Smart Pricing**
- [ ] AI-based price suggestions
- [ ] Market rate integration
- [ ] Competitor price tracking

#### **D. Quote Templates (Admin)**
- [ ] Save entire quote as template
- [ ] Quick apply to new requests
- [ ] Customize before sending

---

## 📊 Estimated Implementation Time

| Phase | Tasks | Time Estimate |
|-------|-------|---------------|
| **Admin Dashboard** | Quote list, price setting, detail view | 2-3 days |
| **Price Management** | Templates, history, bulk actions | 1-2 days |
| **Chat System** | UI component, integration | 1-2 days |
| **Modify Flow** | Customer modification page | 1 day |
| **Notifications** | In-app, email (optional) | 1-2 days |
| **Analytics** | Dashboard, reports | 1-2 days |
| **Polish** | UI/UX, mobile, accessibility | 1-2 days |
| **TOTAL** | **Complete Phase 2** | **8-14 days** |

---

## 🎯 MVP (Minimum Viable Product)

To launch the system, you **MUST** have:
- ✅ Phase 1 (Customer side) - **DONE**
- 🔴 Admin Quote Dashboard - **PRIORITY**
- 🔴 Admin Price Setting - **PRIORITY**
- 🟡 Basic Chat/Messaging - **IMPORTANT**

Everything else can be added later!

---

## 🚀 Recommended Order

1. **Week 1:** Admin Dashboard + Price Setting
2. **Week 2:** Chat System + Modify Flow
3. **Week 3:** Notifications + Analytics
4. **Week 4:** Polish + Testing + Launch

---

## 🎉 When Phase 2 is Complete

You'll have a **fully functional quote-based ecommerce system** where:
- ✅ Customers request quotes without seeing prices
- ✅ Admin reviews and sets custom prices
- ✅ Customer and admin can negotiate
- ✅ Customer accepts and pays
- ✅ Full order tracking
- ✅ Analytics and insights

**This will be a unique competitive advantage for RAJINI PHARMA!** 🏆

---

**Ready to start Phase 2? Let me know!** 🚀
