# RAJINI PHARMA - Ecommerce Platform

**RAJINI PHARMA GENERIC COMMON AND SURGICALS**  
Complete pharmacy ecommerce platform with admin dashboard and Excel-based inventory management.

## 🏪 Business Information

**Address:**  
No. 153/1A1A1, Ground Floor & First Floor  
Periyasavalai Main Road, Anna Nagar  
Thirukoilur Town, Kallakurichi District  
Tamil Nadu - 605757, India

## 🚀 Features

### Customer Features
- 🏠 Modern responsive homepage
- 💊 Medicine catalog with search and filters
- 🛒 Shopping cart functionality
- 📦 Order placement and tracking
- 🔐 User authentication (Register/Login)
- 📋 Prescription upload support
- 📱 Mobile-responsive design

### Admin Features
- 📊 Comprehensive analytics dashboard
- 📦 Inventory management (CRUD operations)
- 📥 Excel import/export for bulk inventory updates
- 🛍️ Order management and status updates
- ⚠️ Low stock and expiry alerts
- 📈 Sales reports and top-selling medicines
- 👥 Customer management

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT + bcrypt
- **Database:** Excel files (xlsx)
- **File Upload:** Multer

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** React Icons

## 📁 Project Structure

```
project-2/
├── backend/
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & upload middleware
│   ├── utils/            # Excel handler utilities
│   ├── config/           # Database configuration
│   ├── data/             # Excel data files
│   ├── uploads/          # Uploaded files
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── context/      # Auth & Cart context
    │   ├── pages/        # Page components
    │   │   ├── admin/    # Admin pages
    │   │   └── ...       # Customer pages
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # Entry point
    └── index.html
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine (Admin)
- `PUT /api/medicines/:id` - Update medicine (Admin)
- `DELETE /api/medicines/:id` - Delete medicine (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order status (Admin)

### Inventory
- `GET /api/inventory` - Get inventory overview (Admin)
- `POST /api/inventory/import-excel` - Import from Excel (Admin)
- `GET /api/inventory/export-excel` - Export to Excel (Admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics (Admin)
- `GET /api/analytics/sales` - Sales report (Admin)

## 👤 Default Users

### Admin Account
- **Email:** admin@rajinipharma.com
- **Password:** admin123

### Customer Account
- **Email:** customer@example.com
- **Password:** customer123

*Note: Create these users manually after first run or register new accounts*

## 📊 Excel Data Format

### Medicines Excel Format
```
| name | category | description | price | stock_quantity | requires_prescription | expiry_date |
```

Example:
```
Paracetamol 500mg | Pain Relief | Fever reducer | 25 | 500 | false | 2026-12-31
```

## 🚀 Deployment Guide

### Backend Deployment (Azure App Service)

1. Create Azure App Service (Node.js)
2. Configure environment variables in Azure
3. Deploy using Git or Azure CLI
4. Estimated cost: ₹500-800/month (B1 tier)

### Frontend Deployment (Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy `dist` folder to Netlify
3. Configure environment variables
4. Free tier available

### Database Migration (Future)

When ready to migrate from Excel to Azure SQL:
1. Create Azure SQL Database
2. Update backend to use SQL adapter
3. Migrate Excel data to SQL
4. Estimated cost: ₹400-600/month (Basic tier)

## 💰 Cost Estimation

### Development (Current)
- **Total:** ₹0 (Local development)

### Production (Azure + Netlify)
- **Backend:** ₹500-800/month (Azure App Service B1)
- **Database:** ₹400-600/month (Azure SQL Basic)
- **Storage:** ₹100-200/month (Azure Blob Storage)
- **Frontend:** ₹0 (Netlify Free)
- **Total:** ₹1000-1600/month

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Customer)
- File upload validation
- CORS protection
- Input validation

## 📱 Mobile Responsive

The entire platform is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Support

For support and queries:
- Visit our store at the address above
- Email: info@rajinipharma.com

## 📄 License

Proprietary - RAJINI PHARMA © 2024

---

**Built with ❤️ for RAJINI PHARMA**

