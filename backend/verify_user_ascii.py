import os
import django
from django.contrib.auth import authenticate
import sys

# Force encoding to utf-8 for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import AdminUser

def verify_user():
    print("=== User Verification Report ===\n")
    
    email = 'admin@gmail.com'
    users = AdminUser.objects.filter(email=email)
    
    if not users.exists():
        print(f"[FAIL] No user found with email: {email}")
        return

    user = users.first()
    print(f"[OK] User found: {user.username} ({user.email})")
    print(f"   Active: {user.is_active}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Superuser: {user.is_superuser}")

    print("\nAttempting authentication...")
    
    # Try with username 'admin'
    u = authenticate(username='admin', password='13579A')
    if u:
        print("[OK] Authentication successful using username='admin'!")
    else:
        print("[FAIL] Authentication FAILED using username='admin'.")

if __name__ == "__main__":
    verify_user()
