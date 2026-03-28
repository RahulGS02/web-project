# 🚀 How to Start RAJINI PHARMA Servers

## ⚡ Quick Start (EASIEST METHOD)

**Double-click this file:**
```
START_SERVERS.bat
```

This will open two Command Prompt windows:
- **Backend Server** (Port 5000)
- **Frontend Server** (Port 3000)

Then open your browser to:
- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 🚨 What Was Blocking Us?

### Issues Fixed:
1. **PowerShell Execution Policy** - PowerShell was blocking npm commands
2. **Missing .env file** - Created with all configuration
3. **Missing node_modules** - Installed all dependencies
4. **Code bugs**:
   - Path duplication in `notificationController.js`
   - Missing database handlers in `paymentController.js`
   - Invalid method calls (`.insert()` → `.create()`)

### Solution:
- Use **Command Prompt (cmd)** instead of PowerShell
- Or use the `START_SERVERS.bat` file which handles everything

---

## 📋 Manual Start (Alternative Method)

If the batch file doesn't work, start manually:

### Step 1: Open Command Prompt (NOT PowerShell)
Press `Win + R`, type `cmd`, press Enter

### Step 2: Start Backend
```cmd
cd c:\rahul\webpage\project-2\backend
node server.js
```

### Step 3: Open Another Command Prompt
Press `Win + R`, type `cmd`, press Enter again

### Step 4: Start Frontend
```cmd
cd c:\rahul\webpage\project-2\frontend
npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

### Customer Pages:
- **Home**: http://localhost:3000
- **Medicines**: http://localhost:3000/medicines
- **Cart**: http://localhost:3000/cart
- **Checkout**: http://localhost:3000/checkout
- **Orders**: http://localhost:3000/orders

### Admin Pages:
- **Dashboard**: http://localhost:3000/admin
- **Inventory**: http://localhost:3000/admin/inventory
- **Orders**: http://localhost:3000/admin/orders
- **Finance**: http://localhost:3000/admin/finance

### Backend API:
- **Health Check**: http://localhost:5000/api/health
- **API Docs**: See `API_DOCUMENTATION.md`

---

## ✅ Verify Servers Are Running

### Check Backend (Port 5000):
```cmd
netstat -ano | findstr :5000
```

### Check Frontend (Port 3000):
```cmd
netstat -ano | findstr :3000
```

---

## 🛑 Stop the Servers

Simply close the Command Prompt windows that are running the servers.

Or press `Ctrl + C` in each terminal.

---

## 🔧 Troubleshooting

### "Port already in use" error:

**Kill process on port 5000:**
```cmd
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>
```

**Kill process on port 3000:**
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

### PowerShell blocking npm:

**Option 1:** Use Command Prompt instead of PowerShell

**Option 2:** Fix PowerShell (Run as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📦 All Pages Are Built and Ready!

✅ Home Page  
✅ Medicines Catalog  
✅ Shopping Cart  
✅ Checkout with Razorpay Payment  
✅ Payment Success Page  
✅ Order Tracking  
✅ Admin Dashboard  
✅ Finance Dashboard (GST, Revenue, Payments)  
✅ Inventory Management  
✅ Orders Management  

---

## 🎉 You're All Set!

The application is fully functional with:
- ✅ Payment Gateway (Razorpay Test Mode)
- ✅ Invoice Generation (Excel with GST)
- ✅ WhatsApp Notifications (Ready to configure)
- ✅ Complete Admin Dashboard
- ✅ Excel-based Data Storage

**Happy Selling! 💊🏥**

