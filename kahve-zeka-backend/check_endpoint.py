import requests

url = "https://kahve-zeka-api.onrender.com/api/analytics/1/view"
print(f"Checking {url}...")
try:
    response = requests.post(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        print("Endpoint NOT FOUND (Deploy pending)")
    else:
        print("Endpoint EXISTS!")
except Exception as e:
    print(f"Error: {e}")
