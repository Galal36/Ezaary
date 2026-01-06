import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Category

# Categories from the image
categories_data = [
    {
        "name_ar": "ترنكات شبابي",
        "name_en": "Youth Tracksuits",
        "slug": "youth-tracksuits",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        "name_ar": "ملابس بيتي",
        "name_en": "Home Wear",
        "slug": "home-wear",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        "name_ar": "ملابس كاجوال",
        "name_en": "Casual Wear",
        "slug": "casual-wear",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        "name_ar": "ملابس رياضية رجالي",
        "name_en": "Men's Sportswear",
        "slug": "mens-sportswear",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        "name_ar": "احذية رياضية",
        "name_en": "Sports Shoes",
        "slug": "sports-shoes",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    },
    {
        "name_ar": "احذية خروج",
        "name_en": "Casual Shoes",
        "slug": "casual-shoes",
        "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"
    },
    {
        "name_ar": "شرابات رياضية",
        "name_en": "Sports Socks",
        "slug": "sports-socks",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        "name_ar": "بنطلونات رياضية",
        "name_en": "Sports Pants",
        "slug": "sports-pants",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    }
]

added_count = 0
for data in categories_data:
    category, created = Category.objects.get_or_create(
        slug=data['slug'],
        defaults={
            'name_ar': data['name_ar'],
            'name_en': data['name_en'],
            'image_url': data['image_url'],
            'is_active': True
        }
    )
    if created:
        print(f"Created: {category.name_ar}")
        added_count += 1
    else:
        # Update name if strictly needed, or just skip
        print(f"Exists: {category.name_ar}")

print(f"\nSuccessfully added {added_count} new categories.")
