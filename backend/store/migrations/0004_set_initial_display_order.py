# Generated migration to set initial display_order values

from django.db import migrations


def set_initial_display_order(apps, schema_editor):
    """Set initial display_order based on created_at (newest first gets lower numbers)"""
    Product = apps.get_model('store', 'Product')
    
    # Get all products ordered by created_at (newest first)
    products = Product.objects.all().order_by('-created_at')
    
    # Assign display_order: newest products get lower numbers (appear first)
    for index, product in enumerate(products):
        product.display_order = index + 1
        product.save(update_fields=['display_order'])


def reverse_set_initial_display_order(apps, schema_editor):
    """Reverse migration - set all display_order to 0"""
    Product = apps.get_model('store', 'Product')
    Product.objects.all().update(display_order=0)


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_add_product_display_order'),
    ]

    operations = [
        migrations.RunPython(set_initial_display_order, reverse_set_initial_display_order),
    ]

