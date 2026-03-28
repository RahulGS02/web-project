# RAJINI PHARMA - Deployment Guide

## 🌐 Deployment Options

This guide covers deploying to Azure (Backend) and Netlify (Frontend) within the ₹2000/month budget.

## 📋 Pre-Deployment Checklist

- [ ] Application tested locally
- [ ] All features working correctly
- [ ] Sample data added
- [ ] Admin account created
- [ ] Environment variables documented
- [ ] Database backup created

## 🔧 Backend Deployment (Azure App Service)

### Option 1: Azure App Service (Recommended)

**Estimated Cost:** ₹500-800/month (B1 Basic tier)

#### Step 1: Prepare Backend for Deployment

1. Update `backend/package.json` to include start script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

2. Create `.deployment` file in backend folder:
```
[config]
command = deploy.sh
```

3. Create `deploy.sh`:
```bash
#!/bin/bash
npm install
```

#### Step 2: Create Azure App Service

1. **Sign up for Azure:**
   - Go to https://azure.microsoft.com
   - Create free account (₹13,300 free credit)

2. **Create App Service:**
   ```bash
   # Install Azure CLI
   # Windows: Download from https://aka.ms/installazurecliwindows
   
   # Login
   az login
   
   # Create resource group
   az group create --name rajini-pharma-rg --location southindia
   
   # Create App Service plan
   az appservice plan create --name rajini-pharma-plan --resource-group rajini-pharma-rg --sku B1 --is-linux
   
   # Create web app
   az webapp create --resource-group rajini-pharma-rg --plan rajini-pharma-plan --name rajini-pharma-api --runtime "NODE|18-lts"
   ```

#### Step 3: Configure Environment Variables

```bash
az webapp config appsettings set --resource-group rajini-pharma-rg --name rajini-pharma-api --settings \
  NODE_ENV=production \
  JWT_SECRET=your_production_jwt_secret_here \
  JWT_EXPIRE=7d \
  PORT=8080
```

#### Step 4: Deploy Backend

```bash
cd backend

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Get deployment credentials
az webapp deployment user set --user-name rajinipharma --password YourPassword123!

# Add Azure remote
az webapp deployment source config-local-git --name rajini-pharma-api --resource-group rajini-pharma-rg

# Deploy
git remote add azure <GIT_URL_FROM_ABOVE_COMMAND>
git push azure main
```

Your API will be available at: `https://rajini-pharma-api.azurewebsites.net`

### Option 2: Railway.app (Alternative - Easier)

**Estimated Cost:** $5/month (~₹400/month)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Add environment variables in Railway dashboard
6. Deploy automatically

## 🎨 Frontend Deployment (Netlify)

**Cost:** FREE

### Step 1: Prepare Frontend

1. Update API URL in `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://rajini-pharma-api.azurewebsites.net',
        changeOrigin: true
      }
    }
  }
})
```

2. Create `frontend/.env.production`:
```
VITE_API_URL=https://rajini-pharma-api.azurewebsites.net
```

3. Update axios base URL in `frontend/src/context/AuthContext.jsx`:
```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
```

### Step 2: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production files.

### Step 3: Deploy to Netlify

#### Option A: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

#### Option B: Netlify Dashboard

1. Go to https://netlify.com
2. Sign up/Login
3. Click "Add new site" → "Deploy manually"
4. Drag and drop the `dist` folder
5. Your site is live!

#### Option C: Continuous Deployment (Best)

1. Push code to GitHub
2. Connect Netlify to your GitHub repo
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Auto-deploy on every push

### Step 4: Configure Custom Domain (Optional)

1. Buy domain from GoDaddy/Namecheap (~₹500/year)
2. In Netlify: Domain settings → Add custom domain
3. Update DNS records as instructed

## 💾 Database Migration (Excel to Azure SQL)

**When to migrate:** When you have 1000+ orders or need better performance

**Estimated Cost:** ₹400-600/month (Basic tier)

### Step 1: Create Azure SQL Database

```bash
# Create SQL server
az sql server create --name rajini-pharma-sql --resource-group rajini-pharma-rg --location southindia --admin-user sqladmin --admin-password YourPassword123!

# Create database
az sql db create --resource-group rajini-pharma-rg --server rajini-pharma-sql --name rajinipharma --service-objective Basic
```

### Step 2: Migrate Data

1. Export Excel to CSV
2. Use Azure Data Studio to import CSV to SQL
3. Update backend code to use SQL instead of Excel
4. Install `mssql` package: `npm install mssql`

### Step 3: Update Backend Code

Replace Excel handlers with SQL queries (code modification required).

## 📊 File Storage (Azure Blob Storage)

**For prescription uploads and images**

**Estimated Cost:** ₹100-200/month

```bash
# Create storage account
az storage account create --name rajinipharmastorage --resource-group rajini-pharma-rg --location southindia --sku Standard_LRS

# Create container
az storage container create --name prescriptions --account-name rajinipharmastorage
```

Update multer configuration to use Azure Blob Storage.

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (automatic on Azure/Netlify)
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Regular backups
- [ ] Monitor error logs

## 📈 Monitoring & Maintenance

### Azure Monitoring

```bash
# View logs
az webapp log tail --name rajini-pharma-api --resource-group rajini-pharma-rg

# Enable application insights
az monitor app-insights component create --app rajini-pharma-insights --location southindia --resource-group rajini-pharma-rg
```

### Netlify Analytics

- Available in Netlify dashboard
- Shows page views, bandwidth usage

## 💰 Cost Breakdown (Monthly)

### Minimal Setup (₹400-500/month)
- Backend: Railway.app ($5 = ₹400)
- Frontend: Netlify (FREE)
- **Total: ~₹400/month**

### Recommended Setup (₹1000-1200/month)
- Backend: Azure App Service B1 (₹500-800)
- Database: Excel files (FREE) or Azure SQL Basic (₹400)
- Frontend: Netlify (FREE)
- **Total: ~₹500-1200/month**

### Full Production (₹1500-2000/month)
- Backend: Azure App Service B1 (₹800)
- Database: Azure SQL Basic (₹500)
- Storage: Azure Blob (₹200)
- Frontend: Netlify (FREE)
- Domain: (₹40/month)
- **Total: ~₹1540/month**

## 🚀 Post-Deployment

1. **Test Everything:**
   - Register new user
   - Browse medicines
   - Place order
   - Admin login
   - Inventory management

2. **Set Up Backups:**
   - Daily database backups
   - Weekly full backups

3. **Monitor Performance:**
   - Check response times
   - Monitor error rates
   - Track user activity

4. **Update DNS:**
   - Point your domain to Netlify
   - Update backend URL in frontend

## 🆘 Troubleshooting

### Backend not accessible
- Check Azure logs: `az webapp log tail`
- Verify environment variables
- Check firewall settings

### Frontend can't connect to backend
- Verify CORS settings
- Check API URL in frontend
- Ensure backend is running

### Database connection issues
- Check connection string
- Verify firewall rules
- Test connection locally first

## 📞 Support Resources

- **Azure Support:** https://azure.microsoft.com/support
- **Netlify Support:** https://www.netlify.com/support
- **Community:** Stack Overflow

---

**Deployment Complete! 🎉**

Your pharmacy is now live and serving customers online!

