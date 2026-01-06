import requests
import sys

try:
    response = requests.get('http://localhost:8000/api/products/')
    print(f"Status Code: {response.status_code}")
    print(f"Content Type: {response.headers.get('Content-Type')}")
    try:
        print(response.json())
    except:
        print("Response Text:")
        print(response.text[:500])
except Exception as e:
    print(f"Error: {e}")
