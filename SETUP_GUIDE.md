# RAJINI PHARMA - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for version control)
- A code editor like **VS Code**

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create a `.env` file in the `backend` folder:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and set your JWT secret:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=rajini_pharma_secret_2024_change_this
JWT_EXPIRE=7d
```

### Step 3: Start Backend Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║        RAJINI PHARMA API Server                          ║
║        Running on port 5000                              ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Step 6: Access the Application

Open your browser and go to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

## 👤 Creating Admin User

Since this is the first run, you need to create an admin user:

### Option 1: Using API (Recommended)

Use Postman, Thunder Client, or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@rajinipharma.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Option 2: Using Frontend

1. Go to http://localhost:3000/register
2. Register with your details
3. Manually edit `backend/data/users.xlsx` to change role to "admin"

## 📦 Adding Sample Medicines

### Option 1: Using Admin Dashboard

1. Login as admin
2. Go to Admin → Inventory
3. Click "Add Medicine"
4. Fill in the details

### Option 2: Import from Excel

1. Create an Excel file with columns:
   - name
   - category
   - description
   - price
   - stock_quantity
   - requires_prescription
   - expiry_date

2. Go to Admin → Inventory
3. Click "Import Excel"
4. Select your file

### Option 3: Use Sample Data

A sample JSON file is provided at `backend/data/sample_medicines.json`. You can manually add these via the admin panel.

## 🧪 Testing the Application

### Test Customer Flow

1. **Browse Medicines**
   - Go to http://localhost:3000/medicines
   - Search and filter medicines

2. **Add to Cart**
   - Click "Add to Cart" on any medicine
   - View cart at top-right

3. **Checkout**
   - Click cart icon
   - Click "Proceed to Checkout"
   - Login if not already logged in
   - Fill shipping address
   - Place order

4. **View Orders**
   - Go to "My Orders"
   - See order status

### Test Admin Flow

1. **Login as Admin**
   - Use admin credentials

2. **View Dashboard**
   - Go to http://localhost:3000/admin
   - See analytics and stats

3. **Manage Inventory**
   - Add/Edit/Delete medicines
   - Import/Export Excel

4. **Manage Orders**
   - View all orders
   - Update order status

## 🔧 Troubleshooting

### Backend won't start

**Error:** `Port 5000 already in use`
- Solution: Change PORT in `.env` to 5001 or kill the process using port 5000

**Error:** `Cannot find module`
- Solution: Run `npm install` again in backend folder

### Frontend won't start

**Error:** `EADDRINUSE: address already in use`
- Solution: Kill the process on port 3000 or Vite will suggest another port

**Error:** `Failed to fetch`
- Solution: Make sure backend is running on port 5000

### Excel files not working

**Error:** `Cannot read Excel file`
- Solution: The files are auto-created. Check `backend/data/` folder exists

### Authentication issues

**Error:** `Not authorized`
- Solution: Make sure you're logged in and token is valid

## 📱 Mobile Testing

To test on mobile devices on the same network:

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Update `frontend/vite.config.js`:
```javascript
server: {
  host: '0.0.0.0',
  port: 3000
}
```

3. Access from mobile: `http://YOUR_IP:3000`

## 🎨 Customization

### Change Brand Colors

Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#YOUR_COLOR',
    // ... other shades
  }
}
```

### Change Company Info

Edit `frontend/src/components/Header.jsx` and `Footer.jsx`

### Add More Categories

Edit the categories array in `frontend/src/pages/Medicines.jsx`

## 📊 Data Management

### Backup Excel Data

Regularly backup the `backend/data/` folder:
```bash
cp -r backend/data backend/data_backup_$(date +%Y%m%d)
```

### Reset Data

To start fresh:
```bash
rm backend/data/*.xlsx
```
Files will be recreated on next server start.

## 🚀 Next Steps

1. ✅ Add real medicines to inventory
2. ✅ Test complete order flow
3. ✅ Customize branding and colors
4. ✅ Add more product categories
5. ✅ Set up regular data backups
6. 📱 Deploy to production (see DEPLOYMENT.md)

## 💡 Tips

- Use Chrome DevTools for debugging
- Check browser console for errors
- Check terminal for backend errors
- Keep both servers running during development
- Use Postman to test API endpoints

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Check the README.md for additional info

---

**Happy Coding! 🎉**

