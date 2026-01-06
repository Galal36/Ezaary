# Coupon System Implementation Guide

## Overview
A complete coupon system has been implemented for the Izaar e-commerce platform, allowing admins to create product-specific coupons and customers to apply them during checkout.

## Backend Implementation

### 1. Database Model (`backend/store/models.py`)
- **Coupon Model**: Stores coupon information including:
  - `code`: Unique coupon code (e.g., "SAVE20")
  - `discount_percentage`: Discount percentage (0-100)
  - `product`: Foreign key to Product (optional - can be global or product-specific)
  - `valid_from` / `valid_to`: Validity period
  - `is_active`: Active status
  - `max_uses`: Maximum usage limit (optional)
  - `used_count`: Current usage count

### 2. API Endpoints (`backend/store/views.py`)
- `GET /api/coupons/` - List all coupons (admin only)
- `GET /api/coupons/{id}/` - Get specific coupon
- `POST /api/coupons/` - Create new coupon (admin only)
- `PUT /api/coupons/{id}/` - Update coupon (admin only)
- `DELETE /api/coupons/{id}/` - Delete coupon (admin only)
- `POST /api/coupons/validate/` - Validate coupon code (public)
- `POST /api/coupons/{id}/increment_usage/` - Increment usage count (admin)

### 3. URL Configuration
Add to your main `urls.py`:
```python
path('api/', include('store.urls')),
```

### 4. Database Migration
Run these commands in your backend directory:
```bash
python manage.py makemigrations store
python manage.py migrate
```

## Frontend Implementation

### 1. Admin Product Form (`client/components/admin/ProductForm.tsx`)
**Features:**
- Display current active coupons for the product (visible by default)
- Create new coupons with:
  - Coupon code
  - Discount percentage
  - Validity dates (from/to)
- Delete existing coupons
- Shows coupon status, usage count, and validity period

**Location in Form:** Added after "Specifications" section, before "Images" section

### 2. Checkout Page (`client/pages/Checkout.tsx`)
**Features:**
- Coupon input field in order summary
- Real-time validation against backend
- Display applied coupon with discount percentage
- Remove coupon option
- Automatic discount calculation
- Shows discount amount in order summary

**User Flow:**
1. User enters coupon code
2. Clicks "تطبيق" (Apply) or presses Enter
3. System validates coupon against backend
4. If valid, discount is applied and shown
5. Order total is recalculated with discount

### 3. API Client (`client/lib/api-client.ts`)
Added `coupons` object with methods:
- `list()` - Get all coupons
- `get(id)` - Get specific coupon
- `create(data)` - Create new coupon
- `update(id, data)` - Update coupon
- `delete(id)` - Delete coupon
- `validate(code, productId?, amount?)` - Validate coupon code

## Usage Instructions

### For Admins:

1. **Creating a Coupon:**
   - Go to Admin → Products
   - Open product form (create or edit)
   - Scroll to "كوبونات الخصم" section
   - Fill in:
     - Coupon code (e.g., "SAVE20")
     - Discount percentage (0-100)
     - Valid from date/time
     - Valid to date/time
   - Click "إضافة كوبون"

2. **Viewing Active Coupons:**
   - Active coupons are displayed by default in the product form
   - Shows: code, discount %, validity period, usage count

3. **Deleting a Coupon:**
   - Click trash icon next to coupon
   - Confirm deletion

### For Customers:

1. **Applying a Coupon:**
   - Go to checkout page
   - In order summary, find "كود الكوبون" section
   - Enter coupon code
   - Click "تطبيق" or press Enter
   - If valid, discount is applied automatically

2. **Removing a Coupon:**
   - Click "إزالة" button next to applied coupon

## Database Schema

```sql
CREATE TABLE store_coupon (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    product_id UUID REFERENCES store_product(id),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Validation Rules

1. **Coupon Code:**
   - Must be unique
   - Case-insensitive (automatically converted to uppercase)
   - Max 50 characters

2. **Discount Percentage:**
   - Must be between 0 and 100
   - Applied to subtotal

3. **Validity:**
   - `valid_from` must be before `valid_to`
   - Coupon must be active
   - Current date must be within validity period

4. **Usage Limits:**
   - If `max_uses` is set, coupon cannot exceed this limit
   - `used_count` is incremented when order is placed

5. **Product-Specific:**
   - If coupon has a `product` assigned, it only works for that product
   - Global coupons (no product) work for all products

## Order Integration

When an order is placed with a coupon:
- `coupon_code` is stored in the order
- `discount_amount` is calculated and stored
- Coupon usage count is incremented (should be done in order creation endpoint)

## Future Enhancements

Possible improvements:
1. Category-specific coupons
2. Minimum order amount requirement
3. First-time customer only coupons
4. Coupon usage history
5. Automatic coupon generation
6. Email/SMS coupon delivery

## Testing Checklist

- [ ] Create coupon in admin
- [ ] View active coupons in product form
- [ ] Edit product and see existing coupons
- [ ] Delete coupon
- [ ] Apply valid coupon in checkout
- [ ] Apply invalid coupon (should show error)
- [ ] Apply expired coupon (should show error)
- [ ] Apply product-specific coupon to wrong product (should show error)
- [ ] Remove applied coupon
- [ ] Verify discount calculation in order summary
- [ ] Verify order total includes discount


