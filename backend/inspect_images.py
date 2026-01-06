import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product, ProductImage

print("--- Checking Product Images ---")
for img in ProductImage.objects.all().order_by('-created_at')[:10]:
    print(f"ID: {img.id}, Product: {img.product.name_ar}, URL: {img.image_url}")
