import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Category, Product

try:
    category_count = Category.objects.count()
    product_count = Product.objects.count()
    
    print(f"Categories: {category_count}")
    print(f"Products: {product_count}")
    
    # Optional: List them for verification
    if product_count > 0:
        print("\nProducts List:")
        for p in Product.objects.all():
            print(f"- {p.name_ar} (Slug: {p.slug})")

except Exception as e:
    print(f"Error: {e}")
