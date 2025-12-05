import requests

try:
    response = requests.get("https://kahve-zeka-api.onrender.com")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
