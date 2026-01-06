#!/usr/bin/env python
"""
Script to check and fix product colors in the database.
Run this from the backend directory: python fix_product_colors.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from django.apps import apps

try:
    Product = apps.get_model('store', 'Product')
except LookupError:
    print("Error: Could not find Product model. Make sure Django is set up correctly.")
    sys.exit(1)

def check_product_colors(sku=None, slug=None):
    """Check colors for a specific product"""
    try:
        if sku:
            product = Product.objects.get(sku=sku)
        elif slug:
            product = Product.objects.get(slug=slug)
        else:
            print("Error: Please provide either sku or slug")
            return None
        
        print(f"\nProduct: {product.name_ar}")
        print(f"SKU: {product.sku}")
        print(f"Slug: {product.slug}")
        print(f"Current colors in database: {product.available_colors}")
        print(f"Colors type: {type(product.available_colors)}")
        
        return product
    except Product.DoesNotExist:
        print(f"Error: Product not found (SKU: {sku}, Slug: {slug})")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def fix_product_colors(sku=None, slug=None, colors=None):
    """Fix colors for a specific product"""
    try:
        if sku:
            product = Product.objects.get(sku=sku)
        elif slug:
            product = Product.objects.get(slug=slug)
        else:
            print("Error: Please provide either sku or slug")
            return False
        
        if colors is None:
            print("\nPlease provide the correct colors as a list.")
            print("Example: fix_product_colors(sku='TRACK-HALF-ZIP-001', colors=['أزرق', 'أبيض', 'أسود'])")
            return False
        
        print(f"\nBefore update: {product.available_colors}")
        
        # Update colors - ensure it's a list
        product.available_colors = list(colors) if colors else []
        
        # Save with explicit field update
        product.save(update_fields=['available_colors'])
        
        # Force database commit and refresh
        from django.db import transaction
        transaction.commit()
        product.refresh_from_db()
        
        print(f"After update: {product.available_colors}")
        
        # Double-check by querying database directly
        product_check = Product.objects.get(sku=sku if sku else product.sku)
        if list(product_check.available_colors) == list(colors):
            print(f"\n✓ Successfully updated colors! Verified: {product_check.available_colors}")
            return True
        else:
            print(f"\n⚠️  Warning: Colors may not have saved correctly.")
            print(f"   Expected: {colors}")
            print(f"   Got: {product_check.available_colors}")
            # Try one more time with direct assignment
            Product.objects.filter(sku=sku if sku else product.sku).update(available_colors=colors)
            product_check.refresh_from_db()
            print(f"   Retry result: {product_check.available_colors}")
            return True
    except Product.DoesNotExist:
        print(f"Error: Product not found (SKU: {sku}, Slug: {slug})")
        return False
    except Exception as e:
        print(f"Error updating colors: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Product Colors Checker & Fixer")
    print("=" * 60)
    
    # Check the specific product first
    print("\n[STEP 1] Checking current colors...")
    product = check_product_colors(sku='TRACK-HALF-ZIP-001')
    
    if product:
        print("\n" + "=" * 60)
        print("[STEP 2] Fixing colors to match admin selection...")
        print("=" * 60)
        
        # Fix the colors - only keep the 3 colors that were selected in admin
        correct_colors = ['أزرق', 'أبيض', 'أسود']
        success = fix_product_colors(sku='TRACK-HALF-ZIP-001', colors=correct_colors)
        
        if success:
            # Verify the fix by fetching fresh from database
            print("\n" + "=" * 60)
            print("[STEP 3] Verifying fix...")
            print("=" * 60)
            # Get fresh instance from database
            fresh_product = Product.objects.get(sku='TRACK-HALF-ZIP-001')
            print(f"\n✓ Final verification - Colors in database: {fresh_product.available_colors}")
            if len(fresh_product.available_colors) == 3 and set(fresh_product.available_colors) == set(['أزرق', 'أبيض', 'أسود']):
                print("✅ SUCCESS! Colors are now correct.")
            else:
                print("⚠️  WARNING: Colors may not have been updated correctly.")
        else:
            print("\n❌ Failed to update colors. Please check the error above.")
    else:
        print("\n❌ Could not find product. Please check the SKU.")

