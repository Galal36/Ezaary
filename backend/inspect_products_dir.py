import os
import sys

# Set encoding for output
sys.stdout.reconfigure(encoding='utf-8')

products_dir = r"C:\Users\Jalal\Downloads\Izaar\products"

try:
    if not os.path.exists(products_dir):
        print(f"Directory not found: {products_dir}")
        sys.exit(1)

    print(f"Scanning: {products_dir}")
    for item in os.listdir(products_dir):
        if "تراك" in item:
            print(f"Found match: {item}")
            full_path = os.path.join(products_dir, item)
            if os.path.isdir(full_path):
                print(f"  Contents of {item}:")
                for subitem in os.listdir(full_path):
                    print(f"    - {subitem}")
except Exception as e:
    print(f"Error: {e}")
