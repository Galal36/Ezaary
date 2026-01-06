import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import AdminUser

# Create admin user
try:
    admin = AdminUser.objects.create_superuser(
        username='admin',
        email='admin@gmail.com',
        password='13579A',
        full_name_ar='Admin',
        role='super_admin'
    )
    print('Admin user created successfully!')
    print('Email: admin@gmail.com')
    print('Password: 13579A')
except Exception as e:
    print(f'Error: {e}')
    print('Admin user might already exist.')





