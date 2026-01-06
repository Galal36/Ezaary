import os
import django
from django.db.utils import OperationalError
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')

try:
    django.setup()
except Exception as e:
    with open('dig_report.txt', 'w', encoding='utf-8') as f:
        f.write(f"Error setting up Django: {e}")
    sys.exit(1)

from store.models import Category, Product, Order, AdminUser, Brand

def dig():
    output = []
    output.append("=== Database Dig Report ===\n")
    
    # Counts
    try:
        output.append(f"Categories: {Category.objects.count()}")
        output.append(f"Brands:     {Brand.objects.count()}")
        output.append(f"Products:   {Product.objects.count()}")
        output.append(f"Orders:     {Order.objects.count()}")
        output.append(f"Users:      {AdminUser.objects.count()}")
    except Exception as e:
        output.append(f"Error querying counts: {e}")
        write_report(output)
        return

    output.append("\n--- Latest Products ---")
    for p in Product.objects.all().order_by('-created_at')[:5]:
        output.append(f"- {p.name_ar} ({p.price} EGP) [Stock: {p.stock_quantity}]")

    output.append("\n--- Categories ---")
    for c in Category.objects.all():
        output.append(f"- {c.name_ar} (Slug: {c.slug})")

    output.append("\n--- Recent Orders ---")
    for o in Order.objects.all().order_by('-created_at')[:5]:
        output.append(f"- #{o.order_number}: {o.customer_name} ({o.total} EGP) - {o.status}")

    write_report(output)

def write_report(lines):
    with open('dig_report.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print("Report written to dig_report.txt")

if __name__ == "__main__":
    dig()
