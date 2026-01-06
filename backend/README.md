# Izaar E-Commerce Backend

Django REST Framework backend for Izaar e-commerce platform.

## Tech Stack

- **Django 6.0**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **Python 3.13+**: Programming language

## Project Structure

```
backend/
├── izaar_backend/        # Main project settings
│   ├── settings.py       # Django settings
│   ├── urls.py          # Main URL configuration
│   └── wsgi.py          # WSGI configuration
├── store/               # Main app
│   ├── models.py        # Database models
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views/viewsets
│   ├── urls.py          # App URL configuration
│   └── admin.py         # Django admin configuration
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (create this)
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

**Option 1: Local PostgreSQL**

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create database:
```sql
CREATE DATABASE izaar_db;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE izaar_db TO postgres;
```

**Option 2: Using Docker**

```bash
docker run --name izaar-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=izaar_db -p 5432:5432 -d postgres:15
```

### 5. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=izaar_db
DB_USER=postgres
DB_PASSWORD=your_password
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

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### 8. Load Initial Data (Optional)

```bash
python manage.py loaddata initial_data.json
```

### 9. Run Development Server

```bash
python manage.py runserver 8000
```

The API will be available at: `http://localhost:8000/api/`

## API Endpoints

### Public Endpoints

- **Products**
  - `GET /api/products/` - List all products
  - `GET /api/products/{slug}/` - Get product details
  - `GET /api/products/featured/` - Get featured products
  - `GET /api/products/new_arrivals/` - Get new arrivals
  - `GET /api/products/on_sale/` - Get products on sale

- **Categories**
  - `GET /api/categories/` - List all categories
  - `GET /api/categories/{slug}/` - Get category details
  - `GET /api/categories/main_categories/` - Get main categories

- **Orders**
  - `POST /api/orders/` - Create new order

- **Banners**
  - `GET /api/banners/` - Get active banners

- **Shipping**
  - `GET /api/shipping-zones/` - List shipping zones
  - `GET /api/shipping-zones/get_shipping_cost/?governorate=أسيوط` - Get shipping cost

- **Reviews**
  - `GET /api/reviews/?product={product_id}` - Get product reviews
  - `POST /api/reviews/` - Submit review

### Admin Endpoints (Requires Authentication)

- **Authentication**
  - `POST /api/admin/login/` - Admin login
    ```json
    {
      "email": "admin@gmail.com",
      "password": "your_password"
    }
    ```
  - `POST /api/admin/logout/` - Admin logout
  - `GET /api/admin/profile/` - Get admin profile

- **Orders Management**
  - `GET /api/orders/` - List all orders
  - `GET /api/orders/{id}/` - Get order details
  - `POST /api/orders/{id}/update_status/` - Update order status
  - `GET /api/orders/statistics/` - Get order statistics

- **Products Management**
  - `POST /api/products/` - Create product
  - `PUT /api/products/{slug}/` - Update product
  - `DELETE /api/products/{slug}/` - Delete product

- **Categories Management**
  - `POST /api/categories/` - Create category
  - `PUT /api/categories/{slug}/` - Update category
  - `DELETE /api/categories/{slug}/` - Delete category

- **Reviews Management**
  - `POST /api/reviews/{id}/approve/` - Approve review
  - `DELETE /api/reviews/{id}/` - Delete review

## Database Schema

The database includes the following main models:

- **Category**: Product categories with hierarchical structure
- **Brand**: Product brands
- **Product**: Main product information with sizes/colors
- **ProductImage**: Multiple images per product
- **Order**: Customer orders (no user accounts required)
- **OrderItem**: Products in each order
- **OrderStatusHistory**: Track order status changes
- **Review**: Customer reviews for products
- **AdminUser**: Admin users for authentication
- **Banner**: Homepage promotional banners
- **ShippingZone**: Shipping costs by governorate
- **DiscountCode**: Promotional discount codes
- **SiteSetting**: Global site settings

## Authentication

The API uses **Token Authentication** for admin users:

1. Login with email and password to get a token
2. Include token in subsequent requests:
   ```
   Authorization: Token <your_token_here>
   ```

## Development Tips

- Use Django admin at `http://localhost:8000/admin/` for quick data management
- API browsable interface available in browser when DEBUG=True
- Check `python manage.py` for available management commands

## Deployment

### For Production:

1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure HTTPS
4. Setup proper database backups
5. Use gunicorn or uwsgi as WSGI server
6. Setup nginx as reverse proxy
7. Configure static/media file serving

### Example Production Commands:

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn izaar_backend.wsgi:application --bind 0.0.0.0:8000
```

## Testing

```bash
# Run tests
python manage.py test

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

## Contact

- WhatsApp: 01204437575
- Facebook: [Izaar إزار](https://www.facebook.com/profile.php?id=61585790939558)
- Email: help@izaar.com





