import requests
import json
import sys

# Force encoding
sys.stdout.reconfigure(encoding='utf-8')

def test_login():
    url = 'http://localhost:8000/api/admin/login/'
    payload = {
        'email': 'admin@gmail.com',
        'password': '13579A'
    }
    
    print(f"Sending POST to {url}")
    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        except:
            print(f"Response (text): {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
