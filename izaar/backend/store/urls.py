# Add this to your existing urls.py or create if it doesn't exist

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, SearchViewSet

router = DefaultRouter()
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'search', SearchViewSet, basename='search')

urlpatterns = [
    path('', include(router.urls)),
]


