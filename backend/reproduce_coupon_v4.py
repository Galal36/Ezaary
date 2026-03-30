import os
import django
import sys
from decimal import Decimal

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.serializers import CouponValidateSerializer
from store.models import Coupon

code = "SALEH55"
valid_product_id = "a6db8a55-cfe2-4688-b093-72b62abc2b34"
invalid_product_id = "00000000-0000-0000-0000-000000000000"

print(f"Testing SMART validation for coupon: {code}")

def test_validate(items, amt, desc):
    print(f"\n--- {desc} ---")
    
    # Extract product IDs from items for the payload
    p_ids = []
    for item in items:
        p_ids.append(item.get('id'))

    data = {
        'code': code,
        'product_ids': p_ids,
        'amount': amt,
        'items': items
    }
    
    serializer = CouponValidateSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
        eligible_amount = serializer.validated_data.get('eligible_amount')
        print(f"Eligible Amount: {eligible_amount}")
        
        c = serializer.validated_data['coupon']
        # Emulate View Logic
        base_amount = eligible_amount if eligible_amount is not None else (Decimal(amt) or 0)
        discount = (base_amount * c.discount_percentage) / 100
        
        print(f"Total Amount: {amt}")
        print(f"Calculated Discount: {discount}")
    else:
        print("INVALID")
        print(serializer.errors)

# Test 1: Mixed Cart
# Valid Item: 100. Invalid Item: 900. Total: 1000.
# Expect Discount: 10% of 100 = 10.
items_mixed = [
    {'id': valid_product_id, 'quantity': 1, 'price': 100.00},
    {'id': invalid_product_id, 'quantity': 1, 'price': 900.00}
]
test_validate(items_mixed, 1000.00, "Mixed Cart (Smart)")

# Test 2: Only Valid Items
items_valid = [
    {'id': valid_product_id, 'quantity': 3, 'price': 100.00}
]
test_validate(items_valid, 300.00, "Valid Cart (3 items)")

# Test 3: Only Invalid Items
items_invalid = [
    {'id': invalid_product_id, 'quantity': 1, 'price': 500.00}
]
test_validate(items_invalid, 500.00, "Invalid Cart")
