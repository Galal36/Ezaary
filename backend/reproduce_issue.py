import os
import sys
import django
from decimal import Decimal

# Add the project directory to the sys.path
sys.path.append('/var/www/izaar/backend/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.serializers import OrderCreateSerializer
from store.models import Product

def run():
    print("Starting reproduction script...")
    
    # 1. Get a product
    product = Product.objects.first()
    if not product:
        print("No products found")
        # Create a dummy product if none exists
        from store.models import Category
        category, _ = Category.objects.get_or_create(name_ar="Test Category", slug="test-category")
        product = Product.objects.create(
            name_ar="Test Product",
            slug="test-product",
            price=100,
            category=category,
            stock_quantity=10,
            description_ar="Test"
        )
        print("Created dummy product")

    print(f"Using product: {product.name_ar} (ID: {product.id})")

    # 2. Prepare data (similar to frontend payload)
    # We use Cairo -> Shipping 60 EGP
    shipping_cost = 60
    subtotal = product.price
    total = subtotal + shipping_cost

    # Create dummy image
    from django.core.files.uploadedfile import SimpleUploadedFile
    dummy_image = SimpleUploadedFile("test_image.jpg", b"dummy_content", content_type="image/jpeg")

    # Dakahlia should be 100 EGP
    gov_name = "الدقهلية"
    shipping_cost = 100
    
    # Use high precision to test the fix
    subtotal = 3800.0000000000005
    total = 3900.0000000000005
    shipping_cost = 100

    data = {
        "customer_name": "Debug User",
        "customer_phone": "01012345678",
        "customer_email": "",
        "governorate": gov_name, 
        "district": "",
        "village": "",
        "detailed_address": "Test Address",
        "subtotal": subtotal,
        "discount_amount": 0,
        "shipping_cost": shipping_cost,
        "total": total,
        "payment_method": "vodafone_cash",
        "payment_screenshot": dummy_image,
        "items": [
            {
                "product": str(product.id),
                "product_name_ar": product.name_ar,
                "quantity": 1,
                "unit_price": product.price,
                "final_unit_price": product.price,
                "subtotal": product.price
            }
        ]
    }

    print("Payload prepared:")
    print(data)

    # 3. Validate and Create
    serializer = OrderCreateSerializer(data=data)
    if serializer.is_valid():
        try:
            order = serializer.save()
            print(f"✅ Order created successfully: {order.order_number}")
        except Exception as e:
            print(f"❌ Error saving order: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("❌ Validation Errors:")
        print(serializer.errors)

if __name__ == "__main__":
    run()
