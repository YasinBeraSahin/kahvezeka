import requests

base_url = "https://kahve-zeka-api.onrender.com"
business_id = 1

endpoints = [
    ("POST", f"/api/analytics/{business_id}/view"),
    ("GET", f"/api/analytics/{business_id}/rating-distribution"), # Checking name mismatch?
    ("GET", f"/api/analytics/{business_id}/ratings"),
    ("GET", f"/api/analytics/{business_id}/stats?days=7")
]

for method, path in endpoints:
    url = f"{base_url}{path}"
    print(f"Checking {method} {url}...")
    try:
        if method == "POST":
            response = requests.post(url)
        else:
            response = requests.get(url) # Auth might be needed, expect 403 or 200
            
        print(f"Status: {response.status_code}")
        
    except Exception as e:
        print(f"Error: {e}")
