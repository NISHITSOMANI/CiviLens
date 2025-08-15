import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

# Register a new user
print('Registering new user...')
register_data = {
    'username': 'testuser1234',
    'email': 'testuser1234@example.com',
    'password': 'testpassword1234',
    'role': 'user'
}

register_response = requests.post(
    f'{BASE_URL}/api/auth/register/',
    headers={'Content-Type': 'application/json'},
    data=json.dumps(register_data)
)

print(f'Register status code: {register_response.status_code}')
print(f'Register response: {register_response.text}')
