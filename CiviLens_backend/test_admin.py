import requests
import json
import time

# Register a new admin user
# Use timestamp to ensure unique username and email
timestamp = str(int(time.time()))
register_data = {
    "username": "adminuser_" + timestamp,
    "email": "admin_" + timestamp + "@example.com",
    "password": "adminpass123",
    "role": "admin"
}

response = requests.post('http://127.0.0.1:8000/api/auth/register/', json=register_data)
print("Registration response:", response.status_code)
print("Registration content:", response.json())

if response.status_code == 200:
    token = response.json()['data']['access']
    print("Token:", token)
    
    # Test admin panel endpoint
    headers = {'Authorization': f'Bearer {token}'}
    admin_response = requests.get('http://127.0.0.1:8000/api/adminpanel/users/', headers=headers)
    print("Admin response:", admin_response.status_code)
    print("Admin content:", admin_response.json())
else:
    print("Registration failed")
