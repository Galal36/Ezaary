import os
import django
import sys
from decimal import Decimal

# Setup Django environment
# Assumes we are running from /var/www/izaar/backend/backend
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Coupon, DiscountCode

code = "SALEH55"

print(f"Checking for code: {code}")

try:
    coupon = Coupon.objects.prefetch_related('products').get(code=code)
    print(f"Found Coupon: {coupon.code}")
    print(f"  Discount: {coupon.discount_percentage}%")
    print(f"  Max Uses: {coupon.max_uses}")
    print(f"  Used Count: {coupon.used_count}")
    print(f"  Valid From: {coupon.valid_from}")
    print(f"  Valid To: {coupon.valid_to}")
    print(f"  Is Active: {coupon.is_active}")
    print(f"  Is Valid Now? {coupon.is_valid()}")
    products = coupon.products.all()
    if products.exists():
        print(f"  Restricted to {products.count()} products:")
        for p in products:
            print(f"    - {p.name_ar} (ID: {p.id})")
    else:
        print("  Apply to ALL products")
except Coupon.DoesNotExist:
    print("Coupon not found.")

try:
    dc = DiscountCode.objects.get(code=code)
    print(f"Found DiscountCode: {dc.code}")
    print(f"  Type: {dc.discount_type}")
    print(f"  Value: {dc.discount_value}")
    print(f"  Min Order: {dc.min_order_amount}")
    print(f"  Max Discount: {dc.max_discount_amount}")
    print(f"  Is Active: {dc.is_active}")
except DiscountCode.DoesNotExist:
    print("DiscountCode not found.")
