import os
import sys
import django

# Add the project directory to the sys.path
sys.path.append('/var/www/izaar/backend/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store_order';")
        columns = cursor.fetchall()
        print("Columns in store_order:")
        for col in columns:
            print(f"- {col[0]} ({col[1]})")
except Exception as e:
    print(f"Error: {e}")
