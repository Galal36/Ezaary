import os
import django
import sys

# Force encoding
sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Product

def check_products():
    print("=== Product Check ===\n")
    
    count = Product.objects.count()
    print(f"Total Products: {count}")
    
    if count == 0:
        print("[WARN] No products found in database.")
    else:
        print("\nLast 5 Products:")
        for p in Product.objects.all().order_by('-created_at')[:5]:
            print(f"- {p.name_ar} (ID: {p.id})")
            print(f"  Price: {p.price}, Stock: {p.stock_quantity}")
            print(f"  Created: {p.created_at}")

if __name__ == "__main__":
    check_products()
