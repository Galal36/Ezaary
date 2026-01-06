# ✅ Izaar Backend Setup Complete!

## 🎉 What's Been Created

Your Django REST Framework backend is now fully set up with:

### ✅ Database (PostgreSQL)
- **Database Name**: `izaar_db`
- **Status**: Created and migrated successfully
- **Tables**: 13 main tables created with all relationships

### ✅ Django Project Structure
```
backend/
├── izaar_backend/          # Main project settings
│   ├── settings.py         # Configured with PostgreSQL, CORS, DRF
│   ├── urls.py            # Main URL routing
│   └── wsgi.py            # WSGI configuration
├── store/                  # Main application
│   ├── models.py          # 13 database models
│   ├── serializers.py     # DRF serializers for all models
│   ├── views.py           # API ViewSets and endpoints
│   ├── urls.py            # API URL routing
│   ├── admin.py           # Django admin configuration
│   └── migrations/        # Database migrations
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── README.md             # Complete documentation
```

### ✅ Database Models Created
1. **AdminUser** - Admin authentication (extends Django User)
2. **Category** - Product categories with hierarchy
3. **Brand** - Product brands
4. **Product** - Main products with sizes/colors (PostgreSQL arrays)
5. **ProductImage** - Multiple images per product
6. **Order** - Customer orders (no user accounts needed)
7. **OrderItem** - Products in each order
8. **OrderStatusHistory** - Track all order status changes
9. **Review** - Customer product reviews
10. **Banner** - Homepage promotional banners
11. **ShippingZone** - Shipping costs by governorate
12. **DiscountCode** - Promotional discount codes
13. **SiteSetting** - Global site settings

### ✅ Admin User Created
- **Email**: `admin@gmail.com`
- **Password**: `13579A`
- **Role**: Super Admin
- **Access**: Full admin dashboard access

### ✅ API Endpoints Available

#### Public Endpoints (No Authentication Required)
- `GET /api/health/` - Health check
- `GET /api/products/` - List all products
- `GET /api/products/{slug}/` - Get product details
- `GET /api/products/featured/` - Featured products
- `GET /api/products/new_arrivals/` - New arrivals
- `GET /api/products/on_sale/` - Products on sale
- `GET /api/categories/` - List categories
- `GET /api/categories/main_categories/` - Main categories only
- `GET /api/brands/` - List brands
- `GET /api/banners/` - Active banners
- `GET /api/shipping-zones/` - Shipping zones
- `GET /api/shipping-zones/get_shipping_cost/?governorate=أسيوط` - Get shipping cost
- `GET /api/reviews/?product={id}` - Product reviews
- `POST /api/reviews/` - Submit review
- `POST /api/orders/` - Create new order

#### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login/` - Admin login
- `POST /api/admin/logout/` - Admin logout
- `GET /api/admin/profile/` - Get admin profile
- `GET /api/orders/` - List all orders
- `GET /api/orders/{id}/` - Order details
- `POST /api/orders/{id}/update_status/` - Update order status
- `GET /api/orders/statistics/` - Order statistics
- `POST /api/products/` - Create product
- `PUT /api/products/{slug}/` - Update product
- `DELETE /api/products/{slug}/` - Delete product
- And more...

## 🚀 How to Start the Server

### 1. Navigate to Backend Directory
```bash
cd C:\Users\Jalal\Downloads\Izaar\front\backend
```

### 2. Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Run Server
```bash
python manage.py runserver 8000
```

The API will be available at: **http://localhost:8000/api/**

## 🔐 Admin Login Example

### Using curl:
```bash
curl -X POST http://localhost:8000/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"13579A"}'
```

### Response:
```json
{
  "token": "your_auth_token_here",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@gmail.com",
    "full_name_ar": "Admin",
    "role": "super_admin"
  }
}
```

### Using the token:
```bash
curl -H "Authorization: Token your_auth_token_here" \
  http://localhost:8000/api/orders/
```

## 📝 Create Order Example

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "أحمد محمد",
    "customer_phone": "01234567890",
    "customer_email": "ahmed@example.com",
    "governorate": "أسيوط",
    "district": "مركز أسيوط",
    "village": "بني غالب",
    "detailed_address": "شارع 15، بجوار المسجد",
    "subtotal": 500.00,
    "discount_amount": 0,
    "shipping_cost": 25.00,
    "total": 525.00,
    "customer_notes": "يرجى الاتصال قبل التوصيل",
    "items": [
      {
        "product": "product_uuid_here",
        "product_name_ar": "قميص رياضي",
        "product_sku": "SKU001",
        "selected_size": "L",
        "selected_color": "أزرق",
        "quantity": 2,
        "unit_price": 200.00,
        "discount_percentage": 0,
        "final_unit_price": 200.00,
        "subtotal": 400.00
      }
    ]
  }'
```

## 🎨 Django Admin Panel

Access the Django admin panel at: **http://localhost:8000/admin/**

Login with:
- **Username**: `admin`
- **Password**: `13579A`

You can manage all data through the admin panel with a user-friendly interface.

## 📊 Database Schema Highlights

### Key Features:
- ✅ **UUID Primary Keys** for all tables
- ✅ **PostgreSQL Arrays** for product sizes/colors
- ✅ **Proper Indexing** for fast queries
- ✅ **Soft Deletes** with `is_active` flags
- ✅ **Audit Trail** with created_at/updated_at timestamps
- ✅ **Order Status Tracking** with full history
- ✅ **Product Ratings** calculated from approved reviews
- ✅ **Flexible Shipping** by governorate

### Order Status Flow:
1. `pending` → Order received
2. `confirmed` → Admin confirmed
3. `processing` → Being prepared
4. `shipped` → Shipped out
5. `out_for_delivery` → Out for delivery
6. `delivered` → Delivered successfully
7. `cancelled` → Cancelled

## 🔧 Environment Configuration

The backend uses environment variables from `.env` file (you need to create this):

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=izaar_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173

# Contact Information
WHATSAPP_NUMBER=01204437575
FACEBOOK_URL=https://www.facebook.com/profile.php?id=61585790939558
SUPPORT_EMAIL=help@izaar.com

# Shipping Settings
DEFAULT_SHIPPING_COST=25
FREE_SHIPPING_THRESHOLD=500
```

## 🔗 Connecting Frontend to Backend

### Update Frontend API Base URL

In your React frontend, create an API client:

```typescript
// client/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // Products
  getProducts: () => fetch(`${API_BASE_URL}/products/`).then(r => r.json()),
  getProduct: (slug: string) => fetch(`${API_BASE_URL}/products/${slug}/`).then(r => r.json()),
  
  // Categories
  getCategories: () => fetch(`${API_BASE_URL}/categories/`).then(r => r.json()),
  
  // Orders
  createOrder: (orderData: any) => 
    fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    }).then(r => r.json()),
  
  // Admin Login
  adminLogin: (email: string, password: string) =>
    fetch(`${API_BASE_URL}/admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),
};
```

### Update AdminAuthContext

Replace the mock login in `client/contexts/AdminAuthContext.tsx`:

```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8000/api/admin/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_email', data.user.email);
      setAdmin({
        email: data.user.email,
        role: 'admin',
        token: data.token,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

## 📦 Next Steps

### 1. Add Sample Products
Use Django admin panel to add products, or create a management command.

### 2. Test API Endpoints
Use Postman, curl, or the DRF browsable API to test endpoints.

### 3. Connect Frontend
Update frontend API calls to use the real backend.

### 4. Deploy to Production
- Set `DEBUG=False`
- Use proper SECRET_KEY
- Configure HTTPS
- Setup Gunicorn + Nginx
- Configure PostgreSQL on VPS

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Database connection error?
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### CORS errors?
- Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`
- Restart the server after changes

## 📚 Documentation

- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **PostgreSQL**: https://www.postgresql.org/docs/

## ✅ Summary

Your backend is **100% ready** for development! You have:
- ✅ Complete database schema
- ✅ All API endpoints
- ✅ Admin authentication
- ✅ Order management
- ✅ Product management
- ✅ Review system
- ✅ Shipping zones
- ✅ Django admin panel

**Server is running at**: http://localhost:8000/
**API Base URL**: http://localhost:8000/api/
**Admin Panel**: http://localhost:8000/admin/

Happy coding! 🚀





