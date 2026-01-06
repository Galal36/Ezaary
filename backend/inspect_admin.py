import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import AdminUser

def inspect_admin():
    print("=== Inspect Admin User ===\n")
    
    try:
        user = AdminUser.objects.get(username='admin')
        print(f"Username: '{user.username}'")
        print(f"Email:    '{user.email}'")
        print(f"Repr(Email): {repr(user.email)}")
        
        # Check exact match query
        found = AdminUser.objects.filter(email='admin@gmail.com').exists()
        print(f"Query filter(email='admin@gmail.com') found: {found}")
        
    except AdminUser.DoesNotExist:
        print("User 'admin' does not exist.")

if __name__ == "__main__":
    inspect_admin()
