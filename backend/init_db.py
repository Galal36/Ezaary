"""
Script to initialize the database with sample data for development
Run with: python manage.py shell < init_db.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import (
    Category, Brand, Product, ProductImage, AdminUser,
    ShippingZone, SiteSetting
)
from django.contrib.auth.hashers import make_password

def init_database():
    print("Initializing database with sample data...")
    
    # Create admin user
    print("\nCreating admin user...")
    admin, created = AdminUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@gmail.com',
            'full_name_ar': 'المدير الرئيسي',
            'role': 'super_admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if created:
        admin.set_password('13579A')
        admin.save()
        print(f"Admin user created: {admin.email} / 13579A")
    else:
        print(f"Admin user already exists: {admin.email}")
    
    # Create categories
    print("\nCreating categories...")
    categories_data = [
        {'name_ar': 'ملابس رياضية رجالي', 'slug': 'sports-mens', 'image_url': '/placeholder.svg'},
        {'name_ar': 'ملابس كاجوال', 'slug': 'casual', 'image_url': '/placeholder.svg'},
        {'name_ar': 'ملابس بيتي', 'slug': 'home-wear', 'image_url': '/placeholder.svg'},
        {'name_ar': 'ترنكات شبابي', 'slug': 'youth-shorts', 'image_url': '/placeholder.svg'},
        {'name_ar': 'بنطلونات رياضية', 'slug': 'sports-pants', 'image_url': '/placeholder.svg'},
        {'name_ar': 'شرابات رياضية', 'slug': 'sports-socks', 'image_url': '/placeholder.svg'},
        {'name_ar': 'احذية خروج', 'slug': 'outdoor-shoes', 'image_url': '/placeholder.svg'},
        {'name_ar': 'احذية رياضية', 'slug': 'sports-shoes', 'image_url': '/placeholder.svg'},
        {'name_ar': 'جوانتيز', 'slug': 'gloves', 'image_url': '/placeholder.svg'},
        {'name_ar': 'كابتشو وطاقية', 'slug': 'hoodies-caps', 'image_url': '/placeholder.svg'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name_ar}")
    
    # Create brands
    print("\nCreating brands...")
    brands_data = [
        {'name_ar': 'شي إن', 'name_en': 'SHEIN', 'slug': 'shein'},
        {'name_ar': 'نايكي', 'name_en': 'Nike', 'slug': 'nike'},
        {'name_ar': 'أديداس', 'name_en': 'Adidas', 'slug': 'adidas'},
    ]
    
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name_en=brand_data['name_en'],
            defaults=brand_data
        )
        if created:
            print(f"Created brand: {brand.name_ar}")
    
    # Create shipping zones
    print("\nCreating shipping zones...")
    shipping_data = [
        {'governorate': 'أسيوط', 'shipping_cost': 25, 'estimated_days': '2-3 أيام'},
        {'governorate': 'القاهرة', 'shipping_cost': 50, 'estimated_days': '3-5 أيام'},
        {'governorate': 'الجيزة', 'shipping_cost': 50, 'estimated_days': '3-5 أيام'},
        {'governorate': 'الإسكندرية', 'shipping_cost': 60, 'estimated_days': '4-6 أيام'},
    ]
    
    for zone_data in shipping_data:
        zone, created = ShippingZone.objects.get_or_create(
            governorate=zone_data['governorate'],
            defaults=zone_data
        )
        if created:
            print(f"Created shipping zone: {zone.governorate}")
    
    # Create site settings
    print("\nCreating site settings...")
    settings_data = [
        {'key': 'whatsapp_number', 'value': '01204437575', 'description': 'رقم الواتساب'},
        {'key': 'facebook_url', 'value': 'https://www.facebook.com/profile.php?id=61585790939558', 'description': 'رابط الفيسبوك'},
        {'key': 'email', 'value': 'help@izaar.com', 'description': 'البريد الإلكتروني'},
        {'key': 'default_shipping_cost', 'value': '25', 'description': 'تكلفة الشحن الافتراضية'},
        {'key': 'free_shipping_threshold', 'value': '500', 'description': 'الحد الأدنى للشحن المجاني'},
    ]
    
    for setting_data in settings_data:
        setting, created = SiteSetting.objects.get_or_create(
            key=setting_data['key'],
            defaults=setting_data
        )
        if created:
            print(f"Created setting: {setting.key}")
    
    print("\nDatabase initialization complete!")
    print("\nAdmin credentials:")
    print("   Email: admin@gmail.com")
    print("   Password: 13579A")

if __name__ == '__main__':
    init_database()

