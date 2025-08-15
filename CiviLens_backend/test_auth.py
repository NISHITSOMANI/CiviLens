import requests
import json
import time

# Register a new user
# Use timestamp to ensure unique username and email
timestamp = str(int(time.time()))
register_data = {
    "username": "testuser_" + timestamp,
    "email": "test_" + timestamp + "@example.com",
    "password": "testpassword123",
    "role": "user"
}

response = requests.post('http://127.0.0.1:8000/api/auth/register/', json=register_data)
print("Registration response:", response.status_code)
print("Registration content:", response.json())

if response.status_code == 200:
    token = response.json()['data']['access']
    print("Token:", token)
    
    # Test profile endpoint
    headers = {'Authorization': f'Bearer {token}'}
    profile_response = requests.get('http://127.0.0.1:8000/api/auth/profile/', headers=headers)
    print("Profile response:", profile_response.status_code)
    print("Profile content:", profile_response.json())
else:
    print("Registration failed")
