# Coupon System Troubleshooting Guide

## Current Issue: "An error occurred" when creating coupon

### Step 1: Check if Migrations Were Run

**CRITICAL**: The coupon table must exist in the database. Run these commands:

```bash
# Navigate to backend directory
cd ../backend

# Activate virtual environment (if using one)
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/Mac:
source venv/bin/activate

# Create migrations
python manage.py makemigrations store

# Apply migrations
python manage.py migrate
```

**Expected Output**: You should see a migration file created for the `Coupon` model.

### Step 2: Verify Backend Server is Running

Make sure Django server is running on port 8000:
```bash
python manage.py runserver 8000
```

### Step 3: Check Browser Console

Open browser DevTools (F12) and check:
1. **Network Tab**: Look for the `/api/coupons/` request
   - Check the request payload
   - Check the response status code
   - Check the response body for error details

2. **Console Tab**: Look for any JavaScript errors

### Step 4: Test API Directly

Test the coupon endpoint directly using curl or Postman:

```bash
# Get your admin token first (from browser localStorage or login)
TOKEN="your_admin_token_here"

# Test creating a coupon
curl -X POST http://localhost:8000/api/coupons/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST20",
    "discount_percentage": 20,
    "product": "product-uuid-here",
    "valid_from": "2024-01-01T00:00:00Z",
    "valid_to": "2024-12-31T23:59:59Z",
    "is_active": true
  }'
```

### Step 5: Common Issues and Fixes

#### Issue 1: 404 Not Found
**Cause**: Coupon URLs not registered or migrations not run
**Fix**: 
- Check `backend/store/urls.py` has `router.register(r'coupons', views.CouponViewSet)`
- Run migrations (Step 1)

#### Issue 2: 401 Unauthorized
**Cause**: Missing or invalid authentication token
**Fix**:
- Make sure you're logged in as admin
- Check `localStorage.getItem('admin_token')` in browser console
- Re-login if needed

#### Issue 3: 400 Bad Request
**Cause**: Invalid data format (especially dates)
**Fix**: 
- Dates should be in ISO format: `"2024-01-01T00:00:00Z"`
- The frontend now converts datetime-local to ISO automatically
- Check browser console for the actual data being sent

#### Issue 4: 500 Internal Server Error
**Cause**: Backend code error
**Fix**:
- Check Django server logs for error details
- Verify all imports are correct in `views.py` and `serializers.py`
- Make sure `Coupon` model is imported in `models.py`

### Step 6: Verify Database Schema

Check if the coupon table exists:

```bash
# Using Django shell
python manage.py shell

# In shell:
from store.models import Coupon
Coupon.objects.count()  # Should not error
```

### Step 7: Check Date Format

The frontend now converts `datetime-local` format to ISO format automatically. The conversion happens in `handleCreateCoupon`:

```typescript
const formatDateTime = (dateTimeLocal: string) => {
  const date = new Date(dateTimeLocal);
  return date.toISOString();
};
```

### Step 8: Enable Debug Logging

The frontend now has enhanced error logging. Check browser console for:
- "Creating coupon with data:" - Shows the exact data being sent
- "API Error Response:" - Shows the detailed error from backend

## Quick Verification Checklist

- [ ] Migrations created and applied
- [ ] Django server running on port 8000
- [ ] Admin user logged in (token exists)
- [ ] Product ID is valid UUID
- [ ] Date fields are filled in
- [ ] Discount percentage is between 0-100
- [ ] Coupon code is not empty
- [ ] Browser console shows detailed error (if any)

## Still Having Issues?

1. **Check Django Server Logs**: Look at the terminal where `runserver` is running
2. **Check Browser Network Tab**: See the exact request/response
3. **Test with curl/Postman**: Bypass frontend to isolate the issue
4. **Verify Backend Code**: Make sure all files were updated correctly

## Expected Behavior

When you click "إضافة كوبون" (Add Coupon):
1. Form validates all fields
2. Dates are converted to ISO format
3. POST request sent to `/api/coupons/`
4. Backend validates and creates coupon
5. Coupon appears in the list below
6. Success message shown

If any step fails, check the error message in the alert or browser console.


