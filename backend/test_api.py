#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import json

# Test the API
url = "http://localhost:8000/api/products/"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    if 'results' in data and len(data['results']) > 0:
        # Find the تراك product
        for product in data['results']:
            if 'تراك' in product.get('name_ar', ''):
                print("=" * 60)
                print(f"Product: {product.get('name_ar')}")
                print(f"Primary Image: {product.get('primary_image')}")
                print("=" * 60)
                break
        else:
            # Show first product
            first = data['results'][0]
            print("=" * 60)
            print(f"First Product: {first.get('name_ar')}")
            print(f"Primary Image: {first.get('primary_image')}")
            print("=" * 60)
    else:
        print("No products found")
else:
    print(f"Error: {response.status_code}")
    print(response.text)


