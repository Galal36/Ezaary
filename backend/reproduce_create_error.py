import requests
import json
import base64

# Simple admin login to get token
try:
    auth_resp = requests.post('http://localhost:8000/api/admin/login/', 
                             json={'email': 'admin@gmail.com', 'password': '13579A'})
    token = auth_resp.json().get('token')
    print(f"Token: {token}")
    
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    product_data = {
        "name_ar": "Test Product",
        "sku": "TEST-SKU-001",
        "price": 100,
        "category": "6e330f81-2292-4820-94f7-30234a91a92e", # I need a valid category ID... 
        # I'll fetch one first
    }

    # Fetch category
    cat_resp = requests.get('http://localhost:8000/api/categories/')
    categories = cat_resp.json()
    if 'results' in categories:
         cat_id = categories['results'][0]['id']
    else:
         cat_id = categories[0]['id']
         
    product_data['category'] = cat_id
    
    print(f"Creating product with data: {product_data}")
    
    resp = requests.post('http://localhost:8000/api/products/', json=product_data, headers=headers)
    print(f"Create Status: {resp.status_code}")
    print(f"Create Response: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
