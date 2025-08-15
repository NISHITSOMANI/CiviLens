import requests
import json

# Test the refresh endpoint
print('Testing refresh endpoint...')
refresh_response = requests.post(
    'http://127.0.0.1:8000/api/auth/refresh/',
    headers={'Content-Type': 'application/json'},
    data=json.dumps({'refresh': 'test_token'})
)

print(f'Refresh endpoint status code: {refresh_response.status_code}')
print(f'Refresh endpoint response: {refresh_response.text}')

# Test the logout endpoint
print('\nTesting logout endpoint...')
logout_response = requests.post(
    'http://127.0.0.1:8000/api/auth/logout/',
    headers={'Content-Type': 'application/json'},
    data=json.dumps({'refresh': 'test_token'})
)

print(f'Logout endpoint status code: {logout_response.status_code}')
print(f'Logout endpoint response: {logout_response.text}')
