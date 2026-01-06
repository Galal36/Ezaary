import urllib.request
import urllib.parse
import urllib.error
import json
import time

def get_token():
    url = 'http://localhost:8000/api/admin/login/'
    data = json.dumps({'email': 'admin@gmail.com', 'password': '13579A'}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))['token']

def get_category():
    url = 'http://localhost:8000/api/categories/'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        if isinstance(data, dict) and 'results' in data:
            return data['results'][0]['id']
        elif isinstance(data, list) and len(data) > 0:
            return data[0]['id']
        return None

try:
    token = get_token()
    print(f"Token: {token}")
    
    cat_id = get_category()
    
    # 1. Create a product first
    create_url = 'http://localhost:8000/api/products/'
    product_data = {
        "name_ar": "Test Update Product " + str(time.time()),
        "sku": "UPDATE-SKU-" + str(int(time.time())),
        "price": 100,
        "discount_percentage": 0,
        "category": cat_id,
        "stock_quantity": 10,
        "is_in_stock": True,
        "images": []
    }
    
    headers = {
        'Authorization': f'Token {token}', 
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(create_url, data=json.dumps(product_data).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        created_product = json.loads(response.read().decode('utf-8'))
        print(f"Created Product Slug: {created_product['slug']}")

    # 2. Update the product
    slug = created_product['slug']
    update_url = f'http://localhost:8000/api/products/{slug}/'
    
    update_data = {
        "name_ar": "Test Update Product EDITED",
        "sku": created_product['sku'],
        "price": 200,
        "discount_percentage": 10,
        "category": cat_id,
        "stock_quantity": 5,
        "is_in_stock": True,
        "images": [], # Empty images logic check
        "available_sizes": ["L"],
        "available_colors": ["Black"]
    }
    
    print(f"Updating Product {slug}...")
    req_put = urllib.request.Request(update_url, data=json.dumps(update_data).encode('utf-8'), headers=headers, method='PUT')
    
    with urllib.request.urlopen(req_put) as response:
        print(f"Update Status Code: {response.getcode()}")
        print(response.read().decode('utf-8'))

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
