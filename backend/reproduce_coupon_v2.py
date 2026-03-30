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

def test_validate(p_ids, amt, desc):
    print(f"\n--- {desc} ---")
    data = {
        'code': code,
        'product_ids': p_ids,
        'amount': amt
    }
    serializer = CouponValidateSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
        # Calculate expected discount to verify logic
        c = serializer.validated_data['coupon']
        discount = (Decimal(amt) * c.discount_percentage) / 100
        print(f"Calculated Discount: {discount}")
    else:
        print("INVALID")
        print(serializer.errors)

# Test 1: Single valid product in list
test_validate([valid_product_id], 500.00, "Single Valid Product in List")

# Test 2: Single invalid product in list
test_validate([invalid_product_id], 500.00, "Single Invalid Product in List")

# Test 3: Mixed valid and invalid products (Should pass now)
test_validate([invalid_product_id, valid_product_id], 1000.00, "Mixed Valid and Invalid Products")

# Test 4: Mixed valid and invalid products (Order swapped)
test_validate([valid_product_id, invalid_product_id], 1000.00, "Mixed Valid and Invalid Products (Swapped)")

# Test 5: Empty list
test_validate([], 500.00, "Empty Product List")

# Test 6: Legacy product_id (Backward Compatibility)
print("\n--- Legacy product_id Compatibility ---")
data = {
    'code': code,
    'product_id': valid_product_id,
    'amount': 500.00
}
serializer = CouponValidateSerializer(data=data)
if serializer.is_valid():
    print("VALID (Legacy Path)")
else:
    print("INVALID (Legacy Path)")
    print(serializer.errors)

