# 🚀 RAJINI PHARMA - DEPLOYMENT GUIDE

Complete guide to deploy RAJINI PHARMA to production (FREE hosting).

---

## 📋 PREREQUISITES

1. GitHub account
2. Render.com account (free)
3. Razorpay account with API keys
4. Git installed on your computer

---

## STEP 1: PUSH TO GITHUB

### 1.1 Initialize Git (if not already done)

```bash
cd c:\rahul\webpage\project-2
git init
git add .
git commit -m "Initial commit - RAJINI PHARMA"
```

### 1.2 Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `rajini-pharma`
3. Description: `E-commerce Pharmacy Platform`
4. Make it **Private** (recommended for business)
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/rajini-pharma.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## STEP 2: DEPLOY BACKEND TO RENDER

### 2.1 Sign Up on Render

1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub account
4. Authorize Render to access your GitHub

### 2.2 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your `rajini-pharma` repository
3. Click "Connect"

### 2.3 Configure Backend Service

**Basic Settings:**
- **Name:** `rajini-pharma-backend`
- **Region:** Singapore (or closest to your location)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Instance Type:**
- Select **Free** tier

### 2.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=(click "Generate" button)
JWT_EXPIRE=7d
EXCEL_DATA_PATH=./data
UPLOAD_PATH=./uploads
GST_RATE=0.12
PLATFORM_FEE_RATE=0.01
INVOICE_PATH=./generated_invoices
WHATSAPP_ENABLED=false
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
BASE_URL=https://rajini-pharma-backend.onrender.com
```

**IMPORTANT:** Replace Razorpay keys with your actual keys!

### 2.5 Deploy Backend

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Once deployed, copy the URL (e.g., `https://rajini-pharma-backend.onrender.com`)

---

## STEP 3: DEPLOY FRONTEND TO RENDER

### 3.1 Create Static Site

1. Click "New +" → "Static Site"
2. Connect same `rajini-pharma` repository
3. Click "Connect"

### 3.2 Configure Frontend Service

**Basic Settings:**
- **Name:** `rajini-pharma`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### 3.3 Add Environment Variable

Add this single variable:

```
VITE_API_URL=https://rajini-pharma-backend.onrender.com
```

Replace with YOUR backend URL from Step 2.5

### 3.4 Deploy Frontend

1. Click "Create Static Site"
2. Wait 5-10 minutes
3. Copy frontend URL (e.g., `https://rajini-pharma.onrender.com`)

---

## STEP 4: CONFIGURE RAZORPAY

### 4.1 Add Website URL

1. Go to: https://dashboard.razorpay.com/app/website-app-settings
2. Add your frontend URL: `https://rajini-pharma.onrender.com`
3. Save settings

### 4.2 Test Payment

1. Visit your live site: `https://rajini-pharma.onrender.com`
2. Add items to cart
3. Checkout with Online Payment
4. Use test card: `4111 1111 1111 1111`

---

## STEP 5: UPDATE BACKEND URL IN RAZORPAY WEBHOOKS (OPTIONAL)

If you want payment confirmations via webhook:

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Create new webhook
3. URL: `https://rajini-pharma-backend.onrender.com/api/payment/webhook`
4. Events: Select "payment.captured" and "payment.failed"

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured
- [ ] Razorpay keys added
- [ ] Razorpay website URL updated
- [ ] Test payment successful
- [ ] Admin login works
- [ ] Orders are being created

---

## 🔗 YOUR LIVE URLS

After deployment, you'll have:

**Customer Site:**
- https://rajini-pharma.onrender.com

**Admin Dashboard:**
- https://rajini-pharma.onrender.com/admin

**Backend API:**
- https://rajini-pharma-backend.onrender.com

---

## ⚠️ IMPORTANT NOTES

1. **Free tier limitations:**
   - Render free tier sleeps after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up
   - Monthly usage limit: 750 hours

2. **Data persistence:**
   - Excel files in `/data` folder persist across deployments
   - Uploaded images in `/uploads` may not persist (use external storage for production)

3. **HTTPS:**
   - Render provides free HTTPS automatically
   - Required for Razorpay payments

---

## 🆘 TROUBLESHOOTING

**Problem:** Backend won't start
- **Solution:** Check Render logs, ensure all environment variables are set

**Problem:** Frontend can't connect to backend
- **Solution:** Verify `VITE_API_URL` is correct in frontend environment variables

**Problem:** Razorpay modal doesn't open
- **Solution:** Check website URL is added in Razorpay dashboard

**Problem:** Payment fails
- **Solution:** Verify Razorpay keys are correct and in test mode

---

## 📞 SUPPORT

If you face issues:
1. Check Render service logs
2. Check browser console for errors
3. Verify all environment variables
4. Test locally first before deploying

---

**Deployment Time:** ~20-30 minutes
**Cost:** FREE (with limitations)
**Upgrade Option:** $7/month for always-on service

