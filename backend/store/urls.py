from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'banners', views.BannerViewSet, basename='banner')
router.register(r'shipping-zones', views.ShippingZoneViewSet, basename='shipping-zone')
router.register(r'site-settings', views.SiteSettingViewSet, basename='site-setting')
router.register(r'coupons', views.CouponViewSet, basename='coupon')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Admin authentication
    path('admin/login/', views.admin_login, name='admin-login'),
    path('admin/logout/', views.admin_logout, name='admin-logout'),
    path('admin/profile/', views.admin_profile, name='admin-profile'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]




