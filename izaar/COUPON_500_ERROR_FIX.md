# Coupon 500 Error Fix

## Issues Fixed

### 1. Serializer Field Access Errors
**Problem**: `product_name` and `product_slug` were trying to access `product.name_ar` and `product.slug` directly, which could fail if:
- Product is `None` (for global coupons)
- Product relationship isn't loaded
- During object creation

**Fix**: Changed to `SerializerMethodField` with safe access:
```python
def get_product_name(self, obj):
    try:
        return obj.product.name_ar if obj.product else None
    except:
        return None
```

### 2. Missing Validation
**Problem**: No validation for:
- Duplicate coupon codes
- Date range validation (valid_from < valid_to)
- Discount percentage range (0-100)

**Fix**: Added comprehensive validation in serializer:
- `validate_code()` - Checks for duplicates and normalizes to uppercase
- `validate()` - Validates date ranges and discount percentage

### 3. Error Handling
**Problem**: Generic 500 errors without details

**Fix**: Added detailed error handling in `create()` method:
- Catches `ValidationError` separately
- Logs full traceback for debugging
- Returns user-friendly error messages

## What to Check Now

### 1. Restart Django Server
After these changes, restart your Django server:
```bash
# Stop the server (Ctrl+C)
# Then restart:
python manage.py runserver 8000
```

### 2. Check Django Server Logs
When you try to create a coupon, check the terminal where Django is running. You should now see:
- Detailed error messages if something fails
- Full traceback for debugging

### 3. Test with Valid Data
Make sure you're entering:
- **Coupon Code**: Unique, not empty (will be converted to uppercase)
- **Discount Percentage**: Between 0 and 100
- **Valid From**: Date/time in the past or present
- **Valid To**: Date/time after "Valid From"
- **Product**: Should be a valid product ID (UUID)

### 4. Common Issues

#### Issue: "كود الكوبون موجود بالفعل" (Code already exists)
- **Solution**: Use a different coupon code

#### Issue: "تاريخ انتهاء الصلاحية يجب أن يكون بعد تاريخ البداية"
- **Solution**: Make sure "Valid To" date is after "Valid From" date

#### Issue: "نسبة الخصم يجب أن تكون بين 0 و 100"
- **Solution**: Enter a discount between 0 and 100

## Debugging Steps

1. **Check Browser Console**:
   - Look for "Creating coupon with data:" log
   - Check the exact data being sent

2. **Check Network Tab**:
   - Find the `/api/coupons/` POST request
   - Check Request Payload
   - Check Response (should show detailed error now)

3. **Check Django Server Terminal**:
   - Look for "Error creating coupon:" message
   - Check the full traceback

4. **Test API Directly**:
   ```bash
   curl -X POST http://localhost:8000/api/coupons/ \
     -H "Authorization: Token YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "code": "TEST20",
       "discount_percentage": 20,
       "product": "PRODUCT_UUID_HERE",
       "valid_from": "2024-01-01T00:00:00Z",
       "valid_to": "2024-12-31T23:59:59Z",
       "is_active": true
     }'
   ```

## Expected Behavior

After these fixes:
1. ✅ Serializer handles None products safely
2. ✅ Validation errors show clear messages
3. ✅ Duplicate codes are caught
4. ✅ Date validation works
5. ✅ Error messages are user-friendly
6. ✅ Full error details logged for debugging

## Next Steps

1. **Restart Django server**
2. **Try creating a coupon again**
3. **Check the error message** - it should now be more specific
4. **If still 500 error**, check Django server logs for the traceback
5. **Share the specific error message** from the response or Django logs

The error should now be more descriptive and help identify the exact issue!


