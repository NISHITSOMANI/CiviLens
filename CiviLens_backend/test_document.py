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
    
    # Test documents endpoint
    # We'll create a simple PDF file to upload
    files = {'file': ('test.pdf', 'This is a test document content', 'application/pdf')}
    headers = {'Authorization': f'Bearer {token}'}
    document_response = requests.post('http://127.0.0.1:8000/api/documents/', files=files, headers=headers)
    print("Document response:", document_response.status_code)
    print("Document content:", document_response.text)
else:
    print("Registration failed")
