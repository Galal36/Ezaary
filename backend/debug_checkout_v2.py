import urllib.request
import json
import sys

def run_debug():
    try:
        # 1. Fetch a valid product to get an ID
        print("Fetching a product ID...", end="")
        with urllib.request.urlopen("http://localhost:8000/api/products/?page_size=1") as response:
            data = json.loads(response.read().decode())
            results = data.get('results', [])
            if not results:
                print(" No products found!")
                return
            
            # Use the slug to get the detailed ID if needed, 
            # but usually the list serializer has 'id' if configured. 
            # If not, we fetch detail.
            first_product = results[0]
            # Assuming list has slug, let's fetch detail to be safe and get UUID
            slug = first_product.get('slug')
            with urllib.request.urlopen(f"http://localhost:8000/api/products/{slug}/") as detail_res:
                 detail = json.loads(detail_res.read().decode())
                 product_id = detail['id']
                 product_name = detail.get('name_ar', 'Test Product')
                 print(f" OK. Using {product_name} ({product_id})")

        # 2. Construct Payload
        payload = {
            "customer_name": "Debug User",
            "customer_phone": "01012345678",
            "customer_email": None,
            "governorate": "أسيوط",
            "district": "أسيوط",
            "village": "",
            "detailed_address": "Test Address 123",
            "customer_notes": "",
            "subtotal": 200,
            "discount_amount": 0,
            "shipping_cost": 25,
            "total": 225,
            "items": [
                {
                    "product": product_id,
                    "product_name_ar": product_name,
                    "product_sku": "SKU-123",
                    "selected_size": "L",
                    "selected_color": "Red",
                    "quantity": 1,
                    "unit_price": 200,
                    "discount_percentage": 0,
                    "final_unit_price": 200,
                    "subtotal": 200
                }
            ]
        }
        
        print("\nSending Payload:")
        print(json.dumps(payload, ensure_ascii=False, indent=2))

        # 3. Send POST request
        req = urllib.request.Request(
            "http://localhost:8000/api/orders/",
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as res:
            print("\n✅ Success! Order created.")
            print("Response:", res.read().decode('utf-8'))
            
    except urllib.error.HTTPError as e:
        print(f"\n❌ HTTP Error {e.code}: {e.reason}")
        error_body = e.read().decode('utf-8')
        print("Error Body:", error_body)
    except Exception as e:
        print(f"\n❌ Execption: {e}")

if __name__ == "__main__":
    run_debug()
