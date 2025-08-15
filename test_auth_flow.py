import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

# Register a new user
print('Registering new user...')
register_data = {
    'username': 'testuser123',
    'email': 'testuser123@example.com',
    'password': 'testpassword123',
    'role': 'user'
}

register_response = requests.post(
    f'{BASE_URL}/api/auth/register/',
    headers={'Content-Type': 'application/json'},
    data=json.dumps(register_data)
)

print(f'Register status code: {register_response.status_code}')
print(f'Register response: {register_response.text}')

if register_response.status_code == 200:
    register_data = register_response.json()
    refresh_token = register_data['data']['refresh']
    access_token = register_data['data']['access']
    
    print(f'\nRefresh token: {refresh_token}')
    print(f'Access token: {access_token}')
    
    # Test refresh endpoint
    print('\nTesting refresh endpoint...')
    refresh_response = requests.post(
        f'{BASE_URL}/api/auth/refresh/',
        headers={'Content-Type': 'application/json'},
        data=json.dumps({'refresh': refresh_token})
    )
    
    print(f'Refresh status code: {refresh_response.status_code}')
    print(f'Refresh response: {refresh_response.text}')
    
    if refresh_response.status_code == 200:
        refresh_data = refresh_response.json()
        new_refresh_token = refresh_data['data']['refresh']
        new_access_token = refresh_data['data']['access']
        
        print(f'\nNew refresh token: {new_refresh_token}')
        print(f'New access token: {new_access_token}')
        
        # Test logout endpoint
        print('\nTesting logout endpoint...')
        logout_response = requests.post(
            f'{BASE_URL}/api/auth/logout/',
            headers={'Content-Type': 'application/json'},
            data=json.dumps({'refresh': new_refresh_token})
        )
        
        print(f'Logout status code: {logout_response.status_code}')
        print(f'Logout response: {logout_response.text}')
    
print('\nTest completed.')
