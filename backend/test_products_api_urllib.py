import urllib.request
import urllib.error
import json
import sys

try:
    req = urllib.request.Request('http://localhost:8000/api/products/')
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        data = response.read().decode('utf-8')
        try:
            json_data = json.loads(data)
            print(json.dumps(json_data, indent=2))
        except:
            print("Response Text:")
            print(data[:500])
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
