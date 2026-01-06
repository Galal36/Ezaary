import urllib.request
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
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json'
    })
    
    print(f"Sending POST to {url}")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            body = response.read().decode('utf-8')
            try:
                print(f"Response: {json.dumps(json.loads(body), indent=2, ensure_ascii=False)}")
            except:
                print(f"Response (text): {body}")
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        body = e.read().decode('utf-8')
        try:
             print(f"Error Response: {json.dumps(json.loads(body), indent=2, ensure_ascii=False)}")
        except:
             print(f"Error Response (text): {body}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
