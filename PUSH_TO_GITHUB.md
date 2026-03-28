# 📤 PUSH TO GITHUB - QUICK GUIDE

## OPTION 1: USING GITHUB DESKTOP (EASIEST)

### Step 1: Download GitHub Desktop
1. Go to: https://desktop.github.com/
2. Download and install
3. Sign in with your GitHub account

### Step 2: Add Repository
1. Open GitHub Desktop
2. Click "File" → "Add Local Repository"
3. Click "Choose..." and select: `c:\rahul\webpage\project-2`
4. Click "Add Repository"

### Step 3: Create GitHub Repository
1. Click "Publish repository"
2. Name: `rajini-pharma`
3. Description: `E-commerce Pharmacy Platform`
4. Choose Private or Public
5. Uncheck "Keep this code private on GitHub" if you want it public
6. Click "Publish repository"

### Step 4: Done!
Your code is now on GitHub! Copy the repository URL for deployment.

---

## OPTION 2: USING COMMAND LINE

### Step 1: Open PowerShell
```powershell
cd c:\rahul\webpage\project-2
```

### Step 2: Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - RAJINI PHARMA Platform"
```

### Step 3: Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `rajini-pharma`
3. Click "Create repository"
4. Copy the URL (looks like: `https://github.com/YOUR_USERNAME/rajini-pharma.git`)

### Step 4: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/rajini-pharma.git
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or personal access token) when prompted.

---

## OPTION 3: USING VS CODE

### Step 1: Open Source Control
1. In VS Code, click the Source Control icon (left sidebar)
2. Click "Initialize Repository"

### Step 2: Commit Changes
1. Enter commit message: "Initial commit - RAJINI PHARMA"
2. Click the ✓ (checkmark) button

### Step 3: Publish to GitHub
1. Click "Publish Branch"
2. Choose "Publish to GitHub"
3. Select "Publish to GitHub private repository" or public
4. Name: `rajini-pharma`
5. Click "OK"

### Step 4: Done!
VS Code will push your code to GitHub automatically.

---

## ✅ VERIFY UPLOAD

After pushing, verify:
1. Go to: https://github.com/YOUR_USERNAME/rajini-pharma
2. You should see all your files
3. Check that `backend/` and `frontend/` folders are there
4. `.env` file should NOT be visible (it's in .gitignore)

---

## 🔐 IMPORTANT: PROTECT YOUR SECRETS

Your `.env` file is already in `.gitignore`, so your secrets won't be uploaded.

**Files that WON'T be pushed (good!):**
- `backend/.env` (contains Razorpay keys)
- `node_modules/` (too large, will be installed during deployment)
- `frontend/.env.local`

**Files that WILL be pushed:**
- All source code
- `backend/data/*.xlsx` (database files)
- Configuration files

---

## 🆘 TROUBLESHOOTING

**Problem:** "git is not recognized"
- **Solution:** Install Git from https://git-scm.com/download/win

**Problem:** "Authentication failed"
- **Solution:** Use GitHub Desktop or create a Personal Access Token:
  1. Go to: https://github.com/settings/tokens
  2. Generate new token (classic)
  3. Use token as password

**Problem:** "Permission denied"
- **Solution:** Make sure you're logged into the correct GitHub account

---

## 📍 NEXT STEPS

After pushing to GitHub:
1. Follow the `DEPLOYMENT_GUIDE.md` to deploy to Render.com
2. Your app will be live with a public URL
3. Configure Razorpay with that URL

---

**Time Required:** 5-10 minutes
**Difficulty:** Easy
**Cost:** FREE

