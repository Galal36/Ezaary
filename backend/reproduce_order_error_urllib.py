import urllib.request
import urllib.parse
import urllib.error
import json
import uuid

def get_product():
    # Helper to get a product ID
    url = 'http://localhost:8000/api/products/'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        results = data.get('results', data) if isinstance(data, dict) else data
        if results and len(results) > 0:
            return results[0]
        return None

try:
    product = get_product()
    if not product:
        print("No products available to test order.")
        exit(1)
        
    url = 'http://localhost:8000/api/orders/'
    
    # Payload matching Checkout.tsx structure
    order_data = {
        "customer_name": "Test Customer",
        "customer_phone": "01012345678",
        "customer_email": "", # Testing empty string behaviour
        "governorate": "أسيوط",
        "district": "Assiut City",
        "village": "",
        "detailed_address": "Test Address",
        "customer_notes": "",
        "subtotal": 100,
        "discount_amount": 0,
        "shipping_cost": 25,
        "total": 125,
        "items": [
            {
                "product": product['id'],
                "product_name_ar": product['name_ar'],
                "product_sku": product['id'],
                "selected_size": "L",
                "selected_color": "Red",
                "quantity": 1,
                "unit_price": 100,
                "discount_percentage": 0,
                "final_unit_price": 100,
                "subtotal": 100
            }
        ]
    }
    
    data = json.dumps(order_data).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    
    req = urllib.request.Request(url, data=data, headers=headers)
    
    print("Sending Order Data...")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(response.read().decode('utf-8'))

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
