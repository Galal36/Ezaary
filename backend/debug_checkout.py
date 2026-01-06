import urllib.request
import urllib.parse
import json
import uuid

# 1. Fetch a valid product
print("Fetching product...")
product_id = None
try:
    with urllib.request.urlopen("http://localhost:8000/api/products/?page_size=1") as response:
        data = json.loads(response.read().decode())
        results = data.get('results', [])
        if results:
            product = results[0]
            # Fetch detail to get ID if list doesn't have it (it should)
            with urllib.request.urlopen(f"http://localhost:8000/api/products/{product['slug']}/") as detail_res:
                detail = json.loads(detail_res.read().decode())
                product_id = detail['id']
                product_name = detail['name_ar']
                print(f"Using Product: {product_name} ({product_id})")
except Exception as e:
    print(f"Failed to fetch product: {e}")
    exit(1)

# 2. Construct Payload
payload = {
    "customer_name": "Test User",
    "customer_phone": "01000000000",
    "customer_email": "", # Testing empty string
    "governorate": "أسيوط",
    "district": "أسيوط",
    "village": "",
    "detailed_address": "Test Address",
    "subtotal": 100,
    "discount_amount": 0,
    "shipping_cost": 25,
    "total": 125,
    "items": [
        {
            "product": product_id,
            "product_name_ar": product_name,
            "product_sku": product_id,
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

print("\nSending Payload:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

# 3. Send Request
req = urllib.request.Request(
    "http://localhost:8000/api/orders/",
    data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as res:
        print("\nSuccess! Status:", res.status)
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print("\nHTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    print(f"\nError: {e}")
