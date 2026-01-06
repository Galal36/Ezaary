import os
import django
from django.contrib.auth import authenticate
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import AdminUser

def verify_user():
    print("=== User Verification Report ===\n")
    
    email = 'admin@gmail.com'
    users = AdminUser.objects.filter(email=email)
    
    if not users.exists():
        print(f"❌ No user found with email: {email}")
        
        # Check by username
        users_by_name = AdminUser.objects.filter(username='admin')
        if users_by_name.exists():
             print(f"✅ Found user with username 'admin': {users_by_name.first().email}")
        else:
             print("❌ No user found with username 'admin' either.")
        return

    user = users.first()
    print(f"✅ User found: {user.username} ({user.email})")
    print(f"   Active: {user.is_active}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Superuser: {user.is_superuser}")

    # Check password
    print("\nAttempting authentication...")
    # NOTE: authenticate() usually expects 'username' and 'password'.
    # If the custom user model or backend is configured differently, we need to know.
    
    # Try with username 'admin'
    u = authenticate(username='admin', password='13579A')
    if u:
        print("✅ Authentication successful using username='admin'!")
    else:
        print("❌ Authentication FAILED using username='admin'.")

    # Try with email as username (some setups do this)
    u_email = authenticate(username=email, password='13579A')
    if u_email:
        print(f"✅ Authentication successful using username='{email}'!")
    else:
        print(f"❌ Authentication FAILED using username='{email}'.")

if __name__ == "__main__":
    verify_user()
