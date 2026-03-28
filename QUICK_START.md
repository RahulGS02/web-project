# 🚀 RAJINI PHARMA - Quick Start Guide

Get your pharmacy ecommerce platform running in **5 minutes**!

## ⚡ Super Quick Setup

### 1️⃣ Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (open new terminal)
cd frontend
npm install
```

### 2️⃣ Configure Environment (30 seconds)

```bash
# In backend folder
cd backend
cp .env.example .env
```

Edit `.env` file - just change the JWT_SECRET:
```
JWT_SECRET=rajini_pharma_2024_secret_key
```

### 3️⃣ Start Servers (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4️⃣ Open Browser (10 seconds)

Go to: **http://localhost:3000**

## 🎉 You're Done!

Your pharmacy platform is now running!

## 👤 First Steps

### Create Admin Account

1. Click **Register** in top-right
2. Fill in details:
   - Name: Your Name
   - Email: admin@rajinipharma.com
   - Password: admin123
3. Click **Create Account**

**Important:** After registration, you need to manually set role to "admin":
- Stop the backend server (Ctrl+C)
- Open `backend/data/users.xlsx`
- Change the `role` column from "customer" to "admin"
- Save and close Excel
- Restart backend: `npm run dev`

### Add Your First Medicine

1. Login with admin account
2. Click **Admin** in navigation
3. Go to **Inventory**
4. Click **Add Medicine**
5. Fill in details:
   - Name: Paracetamol 500mg
   - Category: Pain Relief
   - Price: 25
   - Stock: 100
6. Click **Add Medicine**

### Test Customer Flow

1. Logout (or open incognito window)
2. Go to **Medicines**
3. Click **Add to Cart** on a medicine
4. Click cart icon (top-right)
5. Click **Proceed to Checkout**
6. Register/Login as customer
7. Enter shipping address
8. Click **Place Order**
9. View order in **My Orders**

## 📱 What You Can Do Now

### As Customer:
- ✅ Browse medicines
- ✅ Search and filter
- ✅ Add to cart
- ✅ Place orders
- ✅ Track orders

### As Admin:
- ✅ View dashboard analytics
- ✅ Manage inventory
- ✅ Add/Edit/Delete medicines
- ✅ Import medicines from Excel
- ✅ Manage orders
- ✅ Update order status

## 🎯 Next Steps

1. **Add More Medicines**
   - Use the admin panel
   - Or import from Excel (see template in `backend/data/`)

2. **Customize Branding**
   - Edit company info in `frontend/src/components/Header.jsx`
   - Change colors in `frontend/tailwind.config.js`

3. **Test Everything**
   - Place test orders
   - Try different user roles
   - Test on mobile (responsive design)

4. **Prepare for Production**
   - Read `DEPLOYMENT.md` for deployment guide
   - Set up proper admin credentials
   - Add real medicine inventory

## 🆘 Common Issues

### Backend won't start
```bash
# Port 5000 in use? Change it:
# Edit backend/.env
PORT=5001
```

### Frontend can't connect
```bash
# Make sure backend is running on port 5000
# Check terminal for errors
```

### Excel files not created
```bash
# They're auto-created in backend/data/
# Check if folder exists
ls backend/data/
```

## 📚 Full Documentation

- **README.md** - Complete project overview
- **SETUP_GUIDE.md** - Detailed setup instructions
- **DEPLOYMENT.md** - Production deployment guide
- **backend/data/EXCEL_TEMPLATE_README.md** - Excel data format guide

## 💡 Pro Tips

1. **Keep both terminals open** - You need backend AND frontend running
2. **Use Chrome DevTools** - Press F12 to debug issues
3. **Check console logs** - Errors show in browser console and terminal
4. **Backup your data** - Copy `backend/data/` folder regularly

## 🎊 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Admin account created
- [ ] At least one medicine added
- [ ] Test order placed successfully
- [ ] Admin dashboard accessible

## 🚀 Ready for More?

### Import Sample Medicines

Create `medicines.xlsx` with this data:

| name | category | description | price | stock_quantity | requires_prescription | expiry_date |
|------|----------|-------------|-------|----------------|---------------------|-------------|
| Paracetamol 500mg | Pain Relief | Fever reducer | 25 | 500 | false | 2026-12-31 |
| Amoxicillin 250mg | Antibiotics | Antibiotic | 120 | 200 | true | 2026-06-30 |
| Cetirizine 10mg | Allergy | Allergy relief | 45 | 300 | false | 2026-09-30 |

Then import via Admin → Inventory → Import Excel

### Deploy to Production

When ready to go live:
```bash
# Read the deployment guide
cat DEPLOYMENT.md
```

Estimated cost: ₹400-1500/month depending on features

---

## 🎉 Congratulations!

You now have a fully functional pharmacy ecommerce platform!

**Need help?** Check the detailed guides or create an issue.

**Happy Selling! 💊**

