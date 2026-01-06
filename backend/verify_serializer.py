import os
import django
import sys
import json
from rest_framework.test import APIRequestFactory

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product
from store.serializers import ProductDetailSerializer

print("--- Checking Product Detail Serializer Output ---")
p = Product.objects.last() # Get latest product
if p:
    print(f"Product: {p.name_ar}")
    print(f"DB Sizes: {p.available_sizes}")
    
    serializer = ProductDetailSerializer(p)
    data = serializer.data
    print("Serialized Keys:", data.keys())
    print(f"Serialized Sizes: {data.get('available_sizes')}")
else:
    print("No products found")
