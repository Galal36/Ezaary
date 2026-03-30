import os
import django
import sys
from decimal import Decimal

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.serializers import CouponValidateSerializer
from store.models import Coupon, Product

code = "SALEH55"
valid_product_id = "a6db8a55-cfe2-4688-b093-72b62abc2b34" # One of the valid products
invalid_product_id = "00000000-0000-0000-0000-000000000000" # Invalid UUID

print(f"Testing validation for coupon: {code}")

def test_validate(p_id, amt, desc):
    print(f"\n--- {desc} ---")
    data = {
        'code': code,
        'product_id': p_id,
        'amount': amt
    }
    serializer = CouponValidateSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
        print(serializer.validated_data)
        # Calculate expected discount to verify logic
        c = serializer.validated_data['coupon']
        discount = (Decimal(amt) * c.discount_percentage) / 100
        print(f"Calculated Discount: {discount}")
    else:
        print("INVALID")
        print(serializer.errors)

# Test 1: Valid Product, Quantity 1 (approx price)
test_validate(valid_product_id, 500.00, "Valid Product, Amount 500")

# Test 2: Valid Product, Quantity 3 (approx price * 3)
test_validate(valid_product_id, 1500.00, "Valid Product, Amount 1500 (Qty 3)")

# Test 3: Valid Product, Quantity 6 (approx price * 6)
test_validate(valid_product_id, 3000.00, "Valid Product, Amount 3000 (Qty 6)")

# Test 4: Invalid Product
test_validate(invalid_product_id, 500.00, "Invalid Product")

# Test 5: No Product ID
test_validate(None, 500.00, "No Product ID")

# Check if there are other coupons like SALEH55?
coupons = Coupon.objects.filter(code__icontains="SALEH")
print(f"\nCoupons matching 'SALEH': {[c.code for c in coupons]}")
