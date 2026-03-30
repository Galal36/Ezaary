import os
import django
import uuid
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaar_backend.settings')
django.setup()

from store.views import ProductViewSet
from store.models import Product
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

def test_get_object():
    # 1. Get an existing product
    product = Product.objects.first()
    if not product:
        print("No products in DB")
        return

    print(f"Testing with Product: {product.name_ar} (ID: {product.id}, Slug: {product.slug})")

    # 2. Instantiate ViewSet
    view = ProductViewSet()
    factory_request = APIRequestFactory().get('/')
    # Wrap in DRF Request
    drf_request = Request(factory_request)
    view.request = drf_request
    view.format_kwarg = None
    
    # 3. Test with UUID lookup
    print(f"\n--- Testing UUID lookup: {product.id} ---")
    view.kwargs = {'slug': str(product.id)} # Router passes path param as 'slug' because lookup_field='slug'
    view.lookup_field = 'slug' # Default
    view.lookup_url_kwarg = None
    
    try:
        obj = view.get_object()
        print(f"SUCCESS: Found object: {obj}")
    except Exception as e:
        print(f"FAILURE: {e}")

    # 4. Test with Slug lookup
    print(f"\n--- Testing Slug lookup: {product.slug} ---")
    view.kwargs = {'slug': product.slug}
    
    try:
        obj = view.get_object()
        print(f"SUCCESS: Found object: {obj}")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == '__main__':
    # test_get_object() # Skip unit test for now

    # Inspect URL patterns
    from django.urls import resolve
    from store.urls import router
    
    print("\n--- Router Patterns ---")
    for url in router.urls:
        if 'products' in str(url.pattern):
            print(f"Pattern: {url.pattern}")
            print(f"Name: {url.name}")
            print(f"Lookup: {url.default_args}")
            print("-" * 20)
            
    # Test resolving the UUID path
    uuid_val = "a6db8a55-cfe2-4688-b093-72b62abc2b34"
    path = f"products/{uuid_val}/"
    print(f"\nResolving path: {path}")
    try:
        from django.urls import resolve
        # We need to construct the full urlconf or just test against the router's patterns
        # For simplicity, let's just check regex match against the router's urls
        import re
        matched = False
        for url in router.urls:
            if url.pattern.match(path):
                print(f"MATCHED! Pattern: {url.pattern}")
                print(f"View: {url.callback}")
                matched = True
                break
        if not matched:
            print("NO MATCH FOUND in router.urls")

    except Exception as e:
        print(f"Error resolving: {e}")
