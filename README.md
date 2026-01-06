# Izaar E-Commerce Platform

A modern, full-stack e-commerce platform built with React and Django REST Framework, featuring a complete admin dashboard, product management, order processing, and customer-facing storefront.

## 🚀 Project Overview

Izaar is a comprehensive e-commerce solution with:
- **Frontend**: Modern React SPA with TypeScript, TailwindCSS, and Radix UI
- **Backend**: Django REST Framework API with PostgreSQL
- **Features**: Product catalog, shopping cart, checkout, order management, admin dashboard, search, coupons, and more

## 📁 Project Structure

```
front/
├── izaar/              # Frontend React application
│   ├── client/         # React SPA components and pages
│   ├── server/         # Express server (for development)
│   └── shared/         # Shared TypeScript types
│
└── backend/            # Django REST Framework backend
    ├── izaar_backend/  # Django project settings
    ├── store/          # Main Django app
    └── media/          # Uploaded media files
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router 6** for SPA routing
- **Vite** for build tooling
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **TanStack Query** for data fetching
- **Express** server integration

### Backend
- **Django 6.0** web framework
- **Django REST Framework** for API
- **PostgreSQL** database
- **Pillow** for image processing
- **django-cors-headers** for CORS handling

## 📋 Features

### Customer Features
- ✅ Product browsing and search
- ✅ Category navigation
- ✅ Product details with images, sizes, and colors
- ✅ Shopping cart with persistent storage
- ✅ Wishlist functionality
- ✅ Checkout process with shipping calculation
- ✅ Order confirmation
- ✅ Responsive design (mobile-first)
- ✅ Arabic language support (RTL)

### Admin Features
- ✅ Admin authentication and authorization
- ✅ Dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Category management
- ✅ Order management and status tracking
- ✅ Customer management
- ✅ Reports and analytics
- ✅ Search management
- ✅ Settings configuration
- ✅ Product ordering/drag-and-drop

### Additional Features
- ✅ Coupon/discount code system
- ✅ Shipping zones and cost calculation
- ✅ Product reviews system
- ✅ Banner management
- ✅ Announcement bar
- ✅ Quantity-based offers
- ✅ Search functionality with fuzzy matching

## 🚦 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **PNPM** v10 or higher
- **Python** 3.13 or higher
- **PostgreSQL** 15 or higher

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd izaar
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development server:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Setup PostgreSQL database (see backend README for details)

5. Create `.env` file with required environment variables:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=izaar_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Create superuser:
```bash
python manage.py createsuperuser
```

8. Start development server:
```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

## 📚 Documentation

### Frontend Documentation
See [izaar/README.md](izaar/README.md) for detailed frontend documentation.

### Backend Documentation
See [backend/README.md](backend/README.md) for detailed backend documentation, including:
- API endpoints
- Database schema
- Authentication
- Deployment guide

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/products/` - List all products
- `GET /api/products/{slug}/` - Get product details
- `GET /api/categories/` - List categories
- `POST /api/orders/` - Create order
- `GET /api/shipping-zones/` - Get shipping zones
- `POST /api/coupons/validate/` - Validate coupon code
- `GET /api/search/search/?q={query}` - Search products

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login/` - Admin login
- `GET /api/admin/profile/` - Get admin profile
- `GET /api/orders/` - List all orders
- `POST /api/products/` - Create product
- `PUT /api/products/{slug}/` - Update product
- And more... (see backend README)

## 🗂️ Branch Structure

This repository uses two main branches:
- **`front`** - Contains all frontend code (React application)
- **`back`** - Contains all backend code (Django application)

## 🧪 Development

### Frontend Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - TypeScript validation

### Backend Scripts
- `python manage.py runserver` - Start development server
- `python manage.py makemigrations` - Create migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py test` - Run tests

## 🚢 Deployment

### Frontend Deployment
The frontend can be deployed to:
- **Netlify** (recommended - see `netlify.toml`)
- **Vercel**
- Any static hosting service

### Backend Deployment
The backend should be deployed to:
- **Heroku**
- **DigitalOcean**
- **AWS**
- **Any Python hosting service**

See backend README for detailed deployment instructions.

## 📝 License

Private project - All rights reserved

## 📞 Contact

- **WhatsApp**: 01204437575
- **Facebook**: [Izaar إزار](https://www.facebook.com/profile.php?id=61585790939558)
- **Email**: help@izaar.com

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a scalable, maintainable e-commerce platform.

