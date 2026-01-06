import urllib.request
import urllib.parse
import urllib.error
import json

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
        # Handle paginated or list response
        if isinstance(data, dict) and 'results' in data:
            return data['results'][0]['id']
        elif isinstance(data, list) and len(data) > 0:
            return data[0]['id']
        return None

try:
    token = get_token()
    print(f"Token: {token}")
    
    cat_id = get_category()
    print(f"Category ID: {cat_id}")
    
    if not cat_id:
        print("No category found to create product under.")
        exit(1)

    url = 'http://localhost:8000/api/products/'
    product_data = {
        "name_ar": "Test Product Urllib",
        "description_ar": "Test Description",
        "sku": "URLLIB-SKU-002",
        "price": 150.50,
        "discount_percentage": 10,
        "category": cat_id,
        "stock_quantity": 50,
        "in_stock": True, # Note: Frontend sends 'inStock', serializer maps? No, serializer has 'is_in_stock'. 
        # Wait, Frontend ProductForm.tsx sends 'is_in_stock': data.inStock. 
        # checking serializer fields... ProductCreateSerializer has 'is_in_stock'.
        "is_in_stock": True,
        "available_sizes": ["S", "M"],
        "available_colors": ["Red", "Blue"],
        "images": ["http://example.com/image.jpg"]
    }
    
    data = json.dumps(product_data).encode('utf-8')
    headers = {
        'Authorization': f'Token {token}', 
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, data=data, headers=headers)
    
    print(f"Sending Data: {product_data}")
    
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(response.read().decode('utf-8'))

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
