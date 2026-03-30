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

print(f"Testing validation for coupon: {code} with high precision amount")

def test_validate(amt, desc):
    print(f"\n--- {desc} ---")
    data = {
        'code': code,
        'product_ids': [valid_product_id],
        'amount': amt
    }
    serializer = CouponValidateSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
        # Calculate expected discount to verify logic
        c = serializer.validated_data['coupon']
        discount = (Decimal(amt) * c.discount_percentage) / 100
        print(f"Input Amount: {amt}")
        print(f"Calculated Discount: {discount}")
    else:
        print("INVALID")
        print(serializer.errors)

# Test 1: High precision amount (e.g. from javascript float)
test_validate("3333.3333333333335", "High Precision Amount")

# Test 2: Standard amount
test_validate("3000.00", "Standard Amount")

# Test 3: Very large amount
test_validate("99999999.99", "Large Amount (10 digits)")
