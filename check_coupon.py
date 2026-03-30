import os
import django
import sys

# Setup Django environment
sys.path.append('/var/www/izaar/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.store.models import Coupon, DiscountCode

code = "SALEH55"

print(f"Checking for code: {code}")

try:
    coupon = Coupon.objects.get(code=code)
    print(f"Found Coupon: {coupon.code}")
    print(f"  Discount: {coupon.discount_percentage}%")
    print(f"  Max Uses: {coupon.max_uses}")
    print(f"  Used Count: {coupon.used_count}")
    print(f"  Valid From: {coupon.valid_from}")
    print(f"  Valid To: {coupon.valid_to}")
    print(f"  Is Active: {coupon.is_active}")
    products = coupon.products.all()
    if products.exists():
        print(f"  Restricted to {products.count()} products: {[p.name_ar for p in products]}")
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
