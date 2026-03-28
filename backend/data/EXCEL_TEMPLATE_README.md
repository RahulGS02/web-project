# Excel Data Templates for RAJINI PHARMA

This folder contains Excel files used as the database for the pharmacy system.

## 📁 Files Created Automatically

The following Excel files are automatically created when the server starts:

1. **medicines.xlsx** - Medicine inventory
2. **users.xlsx** - User accounts
3. **orders.xlsx** - Customer orders
4. **order_items.xlsx** - Individual items in orders
5. **prescriptions.xlsx** - Uploaded prescriptions

## 📋 Excel File Formats

### medicines.xlsx

| Column Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| medicine_id | String | Yes | Unique ID (auto-generated) | uuid-v4 |
| name | String | Yes | Medicine name | Paracetamol 500mg |
| category | String | Yes | Medicine category | Pain Relief |
| description | String | No | Product description | Effective pain reliever |
| price | Number | Yes | Price in INR | 25.00 |
| stock_quantity | Number | Yes | Available stock | 500 |
| requires_prescription | Boolean | No | Needs prescription? | true/false |
| expiry_date | Date | No | Expiry date | 2026-12-31 |
| created_at | DateTime | Auto | Creation timestamp | ISO 8601 |

### users.xlsx

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| user_id | String | Yes | Unique ID (auto-generated) |
| name | String | Yes | Full name |
| email | String | Yes | Email address (unique) |
| phone | String | No | Phone number |
| password_hash | String | Yes | Hashed password |
| role | String | Yes | admin or customer |
| created_at | DateTime | Auto | Registration date |

### orders.xlsx

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| order_id | String | Yes | Unique ID (auto-generated) |
| user_id | String | Yes | Customer ID |
| total_amount | Number | Yes | Total order value |
| status | String | Yes | pending/processing/completed/cancelled |
| shipping_address | String | No | Delivery address |
| payment_method | String | No | Payment type |
| created_at | DateTime | Auto | Order date |

### order_items.xlsx

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| order_item_id | String | Yes | Unique ID |
| order_id | String | Yes | Parent order ID |
| medicine_id | String | Yes | Medicine ID |
| medicine_name | String | Yes | Medicine name |
| quantity | Number | Yes | Quantity ordered |
| price | Number | Yes | Unit price |
| subtotal | Number | Yes | Total for this item |

### prescriptions.xlsx

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| prescription_id | String | Yes | Unique ID |
| user_id | String | Yes | Customer ID |
| order_id | String | No | Related order |
| file_path | String | Yes | Upload path |
| file_name | String | Yes | Original filename |
| status | String | Yes | pending/approved/rejected |
| notes | String | No | Customer notes |
| admin_notes | String | No | Admin remarks |
| created_at | DateTime | Auto | Upload date |

## 📥 Importing Medicines from Excel

### Method 1: Using Admin Dashboard

1. Login as admin
2. Go to Inventory Management
3. Click "Import Excel" button
4. Select your Excel file
5. System will import/update medicines

### Method 2: Manual Excel Creation

1. Create new Excel file with columns listed above
2. Add your medicine data
3. Save as `.xlsx` format
4. Import via admin dashboard

### Sample Excel Data

```
name                    | category      | description              | price | stock_quantity | requires_prescription | expiry_date
Paracetamol 500mg      | Pain Relief   | Fever and pain relief   | 25    | 500           | false                | 2026-12-31
Amoxicillin 250mg      | Antibiotics   | Bacterial infections    | 120   | 200           | true                 | 2026-06-30
Cetirizine 10mg        | Allergy       | Allergy relief          | 45    | 300           | false                | 2026-09-30
Omeprazole 20mg        | Gastric       | Acid reflux treatment   | 85    | 150           | false                | 2026-08-31
Metformin 500mg        | Diabetes      | Blood sugar control     | 95    | 180           | true                 | 2026-11-30
```

## 🔄 Data Backup

### Automatic Backup (Recommended)

Create a backup script that runs daily:

**Windows (backup.bat):**
```batch
@echo off
set BACKUP_DIR=backups\%date:~-4,4%%date:~-10,2%%date:~-7,2%
mkdir %BACKUP_DIR%
copy data\*.xlsx %BACKUP_DIR%\
echo Backup completed to %BACKUP_DIR%
```

**Linux/Mac (backup.sh):**
```bash
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
cp data/*.xlsx $BACKUP_DIR/
echo "Backup completed to $BACKUP_DIR"
```

### Manual Backup

Simply copy the entire `data` folder to a safe location.

## ⚠️ Important Notes

1. **Do not manually edit Excel files while server is running** - This may cause data corruption
2. **Always backup before importing** - Import operation updates existing medicines
3. **Use consistent date format** - YYYY-MM-DD (e.g., 2026-12-31)
4. **Boolean values** - Use `true` or `false` (lowercase)
5. **Unique emails** - Each user must have unique email address
6. **Price format** - Use decimal numbers (e.g., 25.50, not 25.5 rupees)

## 🔧 Troubleshooting

### Excel file is locked
- Close Excel application
- Restart the server

### Import fails
- Check column names match exactly
- Verify data types are correct
- Ensure required fields are filled

### Data not showing
- Refresh the page
- Check server logs for errors
- Verify Excel file is in `data` folder

## 📊 Excel Tips

1. **Use Excel Tables** - Format as table for better data management
2. **Data Validation** - Set up dropdowns for categories
3. **Conditional Formatting** - Highlight low stock items
4. **Formulas** - Calculate totals and statistics
5. **Freeze Panes** - Keep headers visible while scrolling

## 🚀 Migration to SQL Database

When you're ready to migrate from Excel to SQL:

1. Export all Excel files to CSV
2. Set up Azure SQL Database
3. Import CSV data to SQL tables
4. Update backend code to use SQL
5. Test thoroughly before switching

See `DEPLOYMENT.md` for detailed migration guide.

---

**Data Management Made Easy! 📊**

