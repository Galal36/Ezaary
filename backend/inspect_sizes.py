import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product

print("--- Checking Product Sizes and Colors ---")
for p in Product.objects.all().order_by('-created_at')[:5]:
    print(f"Product: {p.name_ar}")
    print(f"  Sizes: {p.available_sizes} (Type: {type(p.available_sizes)})")
    print(f"  Colors: {p.available_colors} (Type: {type(p.available_colors)})")
    print("-" * 20)
