import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product

print("START_OUTPUT")
for p in Product.objects.all().order_by('-created_at')[:3]:
    print(f"Name: {p.name_ar}")
    print(f"Sizes: '{p.available_sizes}'")
    print(f"Colors: '{p.available_colors}'")
print("END_OUTPUT")
