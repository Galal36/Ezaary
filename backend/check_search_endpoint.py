#!/usr/bin/env python
"""
Script to check if search endpoint is properly configured
Run this from your Django project root: python check_search_endpoint.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')  # Update this
django.setup()

from django.urls import get_resolver
from django.conf import settings

print("=" * 60)
print("Search Endpoint Configuration Check")
print("=" * 60)

# Check if store app is installed
if 'store' not in settings.INSTALLED_APPS:
    print("❌ ERROR: 'store' is not in INSTALLED_APPS")
    print("   Add 'store' to INSTALLED_APPS in settings.py")
else:
    print("✅ 'store' is in INSTALLED_APPS")

# Check URL patterns
resolver = get_resolver()
url_patterns = []

def collect_urls(patterns, prefix=''):
    for pattern in patterns:
        if hasattr(pattern, 'url_patterns'):
            collect_urls(pattern.url_patterns, prefix + str(pattern.pattern))
        else:
            url_patterns.append(prefix + str(pattern.pattern))

collect_urls(resolver.url_patterns)

# Check for search endpoint
search_found = False
api_found = False
store_found = False

for pattern in url_patterns:
    if 'api' in pattern.lower():
        api_found = True
    if 'store' in pattern.lower() or 'search' in pattern.lower():
        store_found = True
    if 'search' in pattern.lower():
        search_found = True
        print(f"✅ Found search-related URL: {pattern}")

if not api_found:
    print("⚠️  WARNING: No '/api/' URL pattern found")
    print("   Make sure your main urls.py includes: path('api/', include('store.urls'))")

if not store_found:
    print("❌ ERROR: No store URLs found")
    print("   Make sure your main urls.py includes: path('api/', include('store.urls'))")

if not search_found:
    print("❌ ERROR: Search endpoint not found in URL patterns")
    print("   Check backend/store/urls.py and ensure SearchViewSet is registered")

# Try to import search views
print("\n" + "=" * 60)
print("Testing Search Views Import")
print("=" * 60)

try:
    from store.search_views import SearchViewSet
    print("✅ SearchViewSet imported successfully")
except Exception as e:
    print(f"❌ ERROR importing SearchViewSet: {e}")
    print("   Check backend/store/search_views.py for syntax errors")

try:
    from store.search_models import SearchKeyword, SearchAnalytics
    print("✅ Search models imported successfully")
except Exception as e:
    print(f"⚠️  WARNING: Search models import failed: {e}")
    print("   Run: python manage.py makemigrations store")
    print("   Then: python manage.py migrate")

print("\n" + "=" * 60)
print("Summary")
print("=" * 60)
if search_found and api_found:
    print("✅ Search endpoint should be accessible at: /api/search/search/")
else:
    print("❌ Search endpoint is NOT properly configured")
    print("\nTo fix:")
    print("1. Ensure main urls.py includes: path('api/', include('store.urls'))")
    print("2. Run: python manage.py makemigrations store")
    print("3. Run: python manage.py migrate")
    print("4. Restart Django server")

