import urllib.request
import json

try:
    # 1. Get list of products to find a slug
    print("Fetching product list...")
    with urllib.request.urlopen("http://localhost:8000/api/products/?page_size=1") as response:
        data = json.loads(response.read().decode())
        results = data.get('results', [])
        if not results:
            print("No products found.")
            exit()
        
        slug = results[0]['slug']
        print(f"Found product slug: {slug}")

    # 2. Get product details
    print(f"Fetching details for {slug}...")
    with urllib.request.urlopen(f"http://localhost:8000/api/products/{slug}/") as response:
        product = json.loads(response.read().decode())
        print("--- Product Details ---")
        print(f"Name: {product.get('name_ar')}")
        print(f"Available Sizes (Raw): {product.get('available_sizes')}")
        print(f"Available Sizes Type: {type(product.get('available_sizes'))}")
        print(f"Available Colors (Raw): {product.get('available_colors')}")
        print(f"Available Colors Type: {type(product.get('available_colors'))}")

except Exception as e:
    print(f"Error: {e}")
