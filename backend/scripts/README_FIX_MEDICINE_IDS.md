# Fix Medicine IDs - Production Deployment

## Problem
All medicines in the database have `medicine_id: undefined`, causing orders to always show "Paracetamol" regardless of what was ordered.

## Solution
Run the `fixMedicineIds.js` script to assign proper UUIDs to all medicines.

## How to Run on Render

### Method 1: Via Render Shell (Recommended)

1. Go to Render Dashboard
2. Click on your backend service
3. Click "Shell" tab
4. Run: `node scripts/fixMedicineIds.js`
5. Wait for "DONE" message

### Method 2: Temporary Route (If shell doesn't work)

1. Add a temporary admin-only route that runs the fix
2. Call it once via browser
3. Remove the route

## After Fix

1. Clear your cart
2. Add different medicines (NOT Paracetamol)
3. Place a new order
4. Check "My Orders" - should show correct items!

## Note

This only needs to be run ONCE. After medicines have proper IDs, they will persist.

