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
router.register(r'payment-numbers', views.PaymentNumberViewSet, basename='payment-number')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Admin authentication
    path('admin/login/', views.admin_login, name='admin-login'),
    path('admin/logout/', views.admin_logout, name='admin-logout'),
    path('admin/profile/', views.admin_profile, name='admin-profile'),
    
    # Customer authentication
    path('auth/register/', views.CustomerRegisterView.as_view(), name='customer-register'),
    path('auth/verify-email/', views.CustomerVerifyEmailView.as_view(), name='customer-verify-email'),
    path('auth/login/', views.CustomerLoginView.as_view(), name='customer-login'),
    path('auth/logout/', views.CustomerLogoutView.as_view(), name='customer-logout'),
    path('auth/profile/', views.CustomerProfileView.as_view(), name='customer-profile'),
    path('auth/change-password/', views.CustomerChangePasswordView.as_view(), name='customer-change-password'),
    path('auth/password-reset/', views.CustomerPasswordResetRequestView.as_view(), name='customer-password-reset'),
    path('auth/password-reset/confirm/', views.CustomerPasswordResetConfirmView.as_view(), name='customer-password-reset-confirm'),
    path('auth/resend-verification/', views.CustomerResendVerificationView.as_view(), name='customer-resend-verification'),
    path('auth/orders/', views.CustomerOrderListView.as_view(), name='customer-order-list'),
    path('auth/orders/<str:order_number>/', views.CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('auth/orders/<str:order_number>/cancel/', views.CustomerOrderCancelView.as_view(), name='customer-order-cancel'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]




