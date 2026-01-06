#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import django
import json

# Fix encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product, ProductImage
from django.conf import settings

print("=" * 60)
print("Checking Products and Images")
print("=" * 60)

# Get all products
products = Product.objects.all()
print(f"\nTotal Products: {products.count()}\n")

for product in products[:10]:
    try:
        print(f"Product: {product.name_ar}")
        print(f"  SKU: {product.sku}")
        print(f"  Slug: {product.slug}")
        
        images = ProductImage.objects.filter(product=product)
        print(f"  Images Count: {images.count()}")
        
        for img in images:
            print(f"    - Image URL: {img.image_url}")
            print(f"      Is Primary: {img.is_primary}")
            
            # Check if it's a local path
            if img.image_url and ('\\' in img.image_url or (img.image_url.startswith('/') and not img.image_url.startswith('/media'))):
                print(f"      WARNING: Local path detected!")
                if os.path.exists(img.image_url):
                    print(f"      OK: File exists at path")
                else:
                    print(f"      ERROR: File NOT found at path")
        print()
    except Exception as e:
        print(f"Error processing product: {e}")
        print()

print("\n" + "=" * 60)
print("Media Directory Check")
print("=" * 60)
media_products = os.path.join(settings.MEDIA_ROOT, 'products')
print(f"Media products path: {media_products}")
print(f"Exists: {os.path.exists(media_products)}")

if os.path.exists(media_products):
    files = os.listdir(media_products)
    print(f"Files in media/products: {len(files)}")
    for f in files[:5]:
        print(f"  - {f}")

