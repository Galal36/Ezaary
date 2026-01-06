import os
import sys
import django
from django.core.files import File
from django.conf import settings

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.models import Category, Product, ProductImage

# Configuration
PRODUCT_NAME = "تراك نص سوستة"
PRICE = 350
STOCK = 20
DESCRIPTION = """تراك "نص سوسته" بخامة رياضية عملية جداً، ملمسها طري مريح في اللبس وما بيحرّش، مناسب جداً للتمرين أو الخروجات السريعة. التقفيل والقصّة (Fit) مظبوطين عشان يديك شكل رياضي شيك ومرتب، متوفر بـ ٤ ألوان مميزة (الأسود، البترولي، الرصاصي، والمنت جرين) بتصميم عصري وخياطة متينة تستحمل الغسيل واللبس."""
CATEGORY_NAME = "ملابس رياضية"
SIZES = ["M", "L", "XL", "XXL"]
COLORS = ["أسود", "أزرق", "أبيض", "بترولي", "رصاصي", "منت جرين"] # Combined list
SKU = "TRACK-HALF-ZIP-001"

BASE_PATH = r"C:\Users\Jalal\Downloads\Izaar\products"
FOLDER_PARTIAL = "تراك نص سوسته مقاس من mالي ٢اكس سعر ب ٣٠٠"

def run():
    print("Starting product import...")
    
    # 1. Find Folder
    target_folder = None
    if os.path.exists(BASE_PATH):
        for item in os.listdir(BASE_PATH):
            if FOLDER_PARTIAL in item: # Exact match or close enough
                target_folder = os.path.join(BASE_PATH, item)
                break
    
    if not target_folder:
        print(f"Error: Could not find folder matching '{FOLDER_PARTIAL}' in {BASE_PATH}")
        # Try fuzzy match if exact failed?
        return

    print(f"Found folder: {target_folder}")

    # 2. Get/Create Category
    category, created = Category.objects.get_or_create(
        name_ar=CATEGORY_NAME,
        defaults={
            'name_en': 'Sports Wear',
            'slug': 'sports-wear',
            'description_ar': 'ملابس رياضية عالية الجودة'
        }
    )
    if created:
        print(f"Created category: {category}")
    else:
        print(f"Using category: {category}")

    # 3. Create/Update Product
    product, created = Product.objects.update_or_create(
        sku=SKU,
        defaults={
            'name_ar': PRODUCT_NAME,
            'name_en': 'Track Half Zip',
            'description_ar': DESCRIPTION,
            'price': PRICE,
            'stock_quantity': STOCK,
            'category': category,
            'is_active': True,
            'is_in_stock': True,
            'available_sizes': SIZES,
            'available_colors': COLORS,
            'slug': 'track-half-zip'
        }
    )
    print(f"{'Created' if created else 'Updated'} product: {product}")

    # 4. Upload Images
    if not created:
        print("Clearing existing images...")
        product.images.all().delete()

    from django.core.files.storage import default_storage
    import uuid

    image_count = 0
    # Walk through folder recursively to find images
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                full_path = os.path.join(root, file)
                print(f"Found image: {full_path}")
                
                try:
                    with open(full_path, 'rb') as f:
                        # Generate unique filename
                        ext = os.path.splitext(file)[1]
                        filename = f"products/{uuid.uuid4()}{ext}"
                        
                        # Save file
                        path = default_storage.save(filename, File(f))
                        url = settings.MEDIA_URL + path
                        
                        # Create ProductImage
                        img_obj = ProductImage(
                            product=product, 
                            image_url=url,
                            is_primary=(image_count == 0)
                        )
                        img_obj.save()
                        image_count += 1
                except Exception as e:
                    print(f"Failed to upload {file}: {e}")

    print(f"Uploaded {image_count} images.")
    print("Done.")

if __name__ == "__main__":
    run()
