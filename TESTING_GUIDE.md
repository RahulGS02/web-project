# 🧪 Complete Testing Guide - Quote System

## 🎯 Test the Complete Customer Flow

### **Setup:**
1. Make sure backend and frontend are deployed
2. Login as customer: `rahul30@gmail.com` / `Admin@123`

---

## 📝 Test 1: Create Quote Request

### **Steps:**
1. Go to **Medicines** page
2. ✅ Verify: Prices are hidden, shows "Price on Request"
3. ✅ Verify: Blue banner explains quote system
4. Click **"Add to Quote Request"** on 2-3 different medicines
5. Click cart icon in header
6. ✅ Verify: Page shows "Quote Request Cart" (not regular cart)
7. Add notes to each item (optional)
8. Add global notes: "Need best bulk pricing"
9. Click **"Submit Quote Request"**
10. ✅ Verify: Success message appears
11. ✅ Verify: Redirected to "My Quotes" page

**Expected Result:**
- Quote appears in "My Quotes" with status: "PENDING"
- Items shown in preview
- No price displayed yet

---

## 📝 Test 2: Admin Sets Prices (API Test)

Since admin UI isn't built yet, use this API call:

### **Get Auth Token:**
```bash
# Login as admin
curl -X POST https://web-project-lr9c.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul30@gmail.com","password":"Admin@123"}' \
  | jq -r '.token'
```

### **Get Quote Requests:**
```bash
curl https://web-project-lr9c.onrender.com/api/quotes/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Set Prices:**
```bash
# Replace ORDER_ID and ITEM_IDs from previous response
curl -X POST https://web-project-lr9c.onrender.com/api/quotes/ORDER_ID/set-prices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "order_item_id": "ITEM_ID_1",
        "admin_set_price": 200,
        "discount_percent": 10,
        "admin_notes": "Bulk discount applied"
      }
    ],
    "delivery_charges": 50,
    "admin_notes": "Best price provided. Valid for 48 hours.",
    "quote_valid_hours": 48
  }'
```

**Expected Result:**
- Quote status changes to "QUOTE_SENT"
- Customer can now see prices

---

## 📝 Test 3: Customer Views Quote

### **Steps:**
1. Refresh "My Quotes" page
2. ✅ Verify: Quote status changed to "Quote Received"
3. ✅ Verify: Timer shows validity countdown
4. Click on the quote to view details
5. ✅ Verify: All items shown with prices
6. ✅ Verify: Price breakdown visible (subtotal, GST, delivery, total)
7. ✅ Verify: Admin notes visible
8. ✅ Verify: 3 action buttons visible:
   - "Accept & Pay"
   - "Modify Request"
   - "Reject Quote"
9. ✅ Verify: "Send Message to Admin" button visible

**Expected Result:**
- Complete quote details displayed
- All prices and calculations correct
- All action buttons working

---

## 📝 Test 4: Negotiation Chat

### **Steps:**
1. From quote detail page, click **"Send Message to Admin"**
2. ✅ Verify: Chat modal opens
3. ✅ Verify: Empty state shows (no messages yet)
4. Click **"Show quick messages"**
5. ✅ Verify: 5 quick message templates appear
6. Click one template (e.g., "Can you provide a better price?")
7. ✅ Verify: Message appears in input field
8. Click **"Send"**
9. ✅ Verify: Message appears in chat with blue bubble
10. ✅ Verify: Shows "You" as sender
11. ✅ Verify: Timestamp shows
12. Type a custom message: "Looking forward to your response"
13. Click **"Send"**
14. ✅ Verify: Character counter shows (e.g., "48/500")

### **Admin Response (API):**
```bash
curl -X POST https://web-project-lr9c.onrender.com/api/quotes/ORDER_ID/negotiate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"This is the best price we can offer for bulk orders."}'
```

### **Customer Sees Response:**
1. Wait 5 seconds (auto-refresh)
2. ✅ Verify: Admin message appears with green bubble
3. ✅ Verify: Shows "Admin" as sender
4. Close chat modal
5. ✅ Verify: Red unread badge appears on quote (in My Quotes list)
6. Reopen chat
7. ✅ Verify: All messages still there

**Expected Result:**
- Chat works both ways
- Messages persist
- Unread badges work
- Auto-refresh working

---

## 📝 Test 5: Modify Quote Request

### **Steps:**
1. From quote detail page, click **"Modify Request"**
2. ✅ Verify: Modification page loads
3. ✅ Verify: All current items shown
4. ✅ Verify: Original quote total displayed
5. Change quantity of first item (use +/- buttons)
6. ✅ Verify: Quantity updates
7. ✅ Verify: Orange text shows "(was X)" for changed items
8. Update notes for an item
9. Click **"Remove"** button on second item
10. ✅ Verify: Item becomes grayed out and crossed out
11. ✅ Verify: Button changes to "Restore"
12. Click **"Restore"**
13. ✅ Verify: Item becomes active again
14. Remove an item again (for testing)
15. Add global notes: "Changed quantities based on current need"
16. ✅ Verify: "Summary of Changes" section appears
17. ✅ Verify: Lists all changes made
18. Click **"Submit Modification to Admin"**
19. ✅ Verify: Confirmation dialog shows with change summary
20. Confirm
21. ✅ Verify: Success message appears
22. ✅ Verify: Redirected to "My Quotes"
23. ✅ Verify: Quote status changed to "MODIFIED"

**Expected Result:**
- Modification UI intuitive and clear
- All changes tracked
- Summary accurate
- Quote version incremented

---

## 📝 Test 6: Accept Quote & Payment

### **Steps:**
1. Create a fresh quote request (or admin sends new quote)
2. View quote details
3. Click **"Accept & Pay"**
4. ✅ Verify: Confirmation dialog appears
5. Confirm
6. ✅ Verify: Redirected to payment page
7. Complete payment (or COD)
8. ✅ Verify: Order created successfully

**Expected Result:**
- Quote acceptance works
- Payment flow triggered
- Order appears in "My Orders"

---

## 📝 Test 7: Reject Quote

### **Steps:**
1. View a quote (status: QUOTE_SENT)
2. Click **"Reject Quote"**
3. ✅ Verify: Prompt asks for reason
4. Enter reason: "Price too high"
5. ✅ Verify: Success message appears
6. ✅ Verify: Quote status changed to "REJECTED"
7. ✅ Verify: Order status changed to "cancelled"

**Expected Result:**
- Quote rejection works
- Reason saved
- Status updated correctly

---

## 📝 Test 8: Quote Expiry

### **Steps:**
1. Wait for quote to expire (or manually set short validity in API)
2. View expired quote
3. ✅ Verify: Shows "Expired" instead of countdown
4. ✅ Verify: Cannot accept expired quote
5. ✅ Verify: Message shows "Quote expired, contact admin"

**Expected Result:**
- Expiry detection works
- Accept button disabled for expired quotes

---

## 📝 Test 9: Mobile Responsiveness

### **Steps:**
1. Open site on mobile device or use browser DevTools (F12 → Toggle Device Toolbar)
2. Test all pages:
   - Medicines (grid should stack)
   - Quote Request Cart
   - My Quotes (cards should stack)
   - Quote Detail
   - Modification Page
   - Chat Modal
3. ✅ Verify: All elements readable and usable
4. ✅ Verify: Buttons touchable (not too small)
5. ✅ Verify: Forms work on mobile keyboards

**Expected Result:**
- Fully responsive on all screen sizes
- No horizontal scrolling
- Touch-friendly interface

---

## 📝 Test 10: Edge Cases

### **Test Empty States:**
- ✅ Empty cart (shows empty state with icon)
- ✅ No quotes yet (shows "Create your first quote" button)
- ✅ No messages in chat (shows empty state)

### **Test Error Handling:**
- ✅ Submit quote without items (should show error)
- ✅ Modify without changes (should show message)
- ✅ Send empty message (Send button disabled)
- ✅ Network error (should show error message)

### **Test Data Validation:**
- ✅ Phone number validation (10 digits, starts with 6-9)
- ✅ Pincode validation (6 digits)
- ✅ Message character limit (500 max)

---

## ✅ Success Criteria

All tests should pass with ✅

**If any test fails:**
1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify Render services are running
4. Check backend logs on Render

---

## 🎉 When All Tests Pass

**Congratulations!** The Quote System is working perfectly!

You can now:
1. ✅ Accept real quote requests from customers
2. ✅ Set custom prices via API (until admin UI is ready)
3. ✅ Communicate with customers via chat
4. ✅ Process accepted quotes as regular orders

---

**Next: Build Admin Dashboard for easier quote management!** 🚀
