# Coupon Backend Setup Instructions

## ✅ What Has Been Done

1. **Coupon Model Added** (`backend/store/models.py`)
   - Added `Coupon` model with all required fields
   - Added validation methods

2. **Serializers Added** (`backend/store/serializers.py`)
   - `CouponSerializer` for full coupon data
   - `CouponValidateSerializer` for validation

3. **ViewSet Added** (`backend/store/views.py`)
   - `CouponViewSet` with CRUD operations
   - Validation endpoint (`/api/coupons/validate/`)
   - Usage tracking endpoint

4. **URLs Registered** (`backend/store/urls.py`)
   - Coupon routes registered in router

5. **Admin Interface** (`backend/store/admin.py`)
   - Coupon admin panel added

## 🔧 Next Steps (REQUIRED)

### 1. Run Database Migrations

Navigate to the backend directory and run:

```bash
cd ../backend
python manage.py makemigrations store
python manage.py migrate
```

This will create the `store_coupon` table in your database.

### 2. Restart Django Server

After migrations, restart your Django development server:

```bash
python manage.py runserver 8000
```

### 3. Test the API

You can test the coupon endpoints:

```bash
# List coupons (requires admin auth)
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/coupons/

# Validate coupon (public)
curl -X POST http://localhost:8000/api/coupons/validate/ \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST20", "amount": 100}'
```

## 📋 API Endpoints

- `GET /api/coupons/` - List all coupons (admin)
- `GET /api/coupons/{id}/` - Get specific coupon (admin)
- `POST /api/coupons/` - Create coupon (admin)
- `PUT /api/coupons/{id}/` - Update coupon (admin)
- `DELETE /api/coupons/{id}/` - Delete coupon (admin)
- `POST /api/coupons/validate/` - Validate coupon code (public)
- `POST /api/coupons/{id}/increment_usage/` - Increment usage (admin)

## 🔍 Query Parameters

- `?product_id=UUID` - Filter by product
- `?active_only=true` - Show only active coupons

## ⚠️ Important Notes

1. **Authentication**: Most endpoints require admin authentication (Token auth)
2. **Validation Endpoint**: The `/validate/` endpoint is public (no auth required)
3. **Product-Specific**: Coupons can be linked to specific products or be global (product=null)

## 🐛 Troubleshooting

If you get a 404 error:
1. Make sure migrations ran successfully
2. Restart the Django server
3. Check that `store.urls` is included in main `urls.py` (it should be at `/api/`)
4. Verify the URL pattern: `/api/coupons/` not `/api/coupon/`

If you get import errors:
1. Make sure all imports are correct in `views.py` and `serializers.py`
2. Check that `Coupon` is imported in `models.py` imports


