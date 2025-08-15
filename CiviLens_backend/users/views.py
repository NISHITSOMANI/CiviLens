import json
import hashlib
import secrets
import time
from django.views import View
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from core.jwt_utils import create_access_token, create_refresh_token, decode_token
from db_connection import db

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to verify passwords
def verify_password(password, hashed):
    return hash_password(password) == hashed

# Helper function to create a new user in MongoDB
def create_user(username, email, password, role='user', region=None):
    print(f"Creating user: username={username}, email={email}, role={role}, region={region}")
    users_collection = db['users']
    
    # Check if user already exists
    existing_user = users_collection.find_one({'$or': [{'username': username}, {'email': email}]})
    print(f"Existing user check result: {existing_user}")
    if existing_user is not None:
        print("User already exists")
        return None
    
    # Create user document
    user_doc = {
        'username': username,
        'email': email,
        'password': hash_password(password),
        'role': role,
        'region': region if region else "",
        'is_active': True,
        'is_staff': role == 'admin'
    }
    
    print(f"Inserting user document: {user_doc}")
    result = users_collection.insert_one(user_doc)
    user_doc['_id'] = str(result.inserted_id)
    print(f"User created successfully with ID: {user_doc['_id']}")
    return user_doc

# Helper function to get user by username
def get_user_by_username(username):
    users_collection = db['users']
    return users_collection.find_one({'username': username})

# Helper function to authenticate user
def authenticate_user(username, password):
    user = get_user_by_username(username)
    if user and verify_password(password, user['password']):
        return user
    return None

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            print(f"Received registration request: {request.body}")
            data = json.loads(request.body)
            print(f"Parsed data: {data}")
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role', 'user')

            print(f"Username: {username}, Email: {email}, Password: {password}, Role: {role}")

            # Only include region if provided and not None
            region = data.get('region')
            print(f"Region: {region}")

            # Validate required fields
            if not username or not email or not password:
                print("Missing required fields")
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'Username, email, and password are required'}
                }, status=400)

            # Create user in MongoDB
            user = create_user(
                username=username,
                email=email,
                password=password,
                role=role,
                region=region
            )
            
            if user is None:
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'User with this username or email already exists'}
                }, status=400)

            # Create refresh token in MongoDB
            refresh_tokens_collection = db['refresh_tokens']
            refresh = create_refresh_token(user)
            refresh_tokens_collection.insert_one({
                'user_id': user['_id'],
                'token': refresh,
                'created_at': int(time.time() * 1000),  # Store as timestamp
                'revoked': False
            })

            access = create_access_token(user)

            return JsonResponse({
                'success': True,
                'data': {'access': access, 'refresh': refresh}
            })

        except Exception as e:
            import traceback
            print(f"Registration error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return JsonResponse({
                'success': False,
                'error': {'message': str(e)}
            }, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate_user(username, password)
            if user is None:
                return JsonResponse({'success': False, 'error': {'message':'Invalid credentials'}}, status=401)
            
            # Create refresh token in MongoDB
            refresh_tokens_collection = db['refresh_tokens']
            refresh = create_refresh_token(user)
            refresh_tokens_collection.insert_one({
                'user_id': user['_id'],
                'token': refresh,
                'created_at': int(time.time() * 1000),  # Store as timestamp
                'revoked': False
            })
            
            access = create_access_token(user)
            return JsonResponse({'success': True, 'data': {'access': access, 'refresh': refresh, 'user': {'id': str(user['_id']), 'username': user['username'], 'role': user['role']}}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class ProfileView(View):
    def get(self, request):
        # Extract user info from JWT token (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        if not user_data:
            return JsonResponse({'success': False, 'error': {'message':'Authentication required'}}, status=401)
        
        # Get full user info from MongoDB
        # Convert string user_id back to ObjectId for MongoDB query
        from bson import ObjectId
        users_collection = db['users']
        user = users_collection.find_one({'_id': ObjectId(user_data['_id'])})
        if not user:
            return JsonResponse({'success': False, 'error': {'message':'User not found'}}, status=404)
            
        return JsonResponse({'success': True, 'data': {'id': str(user['_id']), 'username': user['username'], 'email': user['email'], 'role': user['role']}})


@method_decorator(csrf_exempt, name='dispatch')
class RefreshTokenView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh')
            
            if not refresh_token:
                return JsonResponse({'success': False, 'error': {'message': 'Refresh token is required'}}, status=400)
            
            # Decode the refresh token
            payload = decode_token(refresh_token)
            if not payload or payload.get('type') != 'refresh':
                return JsonResponse({'success': False, 'error': {'message': 'Invalid refresh token'}}, status=401)
            
            # Check if the refresh token exists in the database and is not revoked
            refresh_tokens_collection = db['refresh_tokens']
            token_record = refresh_tokens_collection.find_one({'token': refresh_token, 'revoked': False})
            
            if not token_record:
                return JsonResponse({'success': False, 'error': {'message': 'Refresh token not found or revoked'}}, status=401)
            
            # Get user from database
            from bson import ObjectId
            users_collection = db['users']
            user = users_collection.find_one({'_id': ObjectId(payload['user_id'])})
            
            if not user:
                return JsonResponse({'success': False, 'error': {'message': 'User not found'}}, status=404)
            
            # Revoke the old refresh token
            refresh_tokens_collection.update_one(
                {'_id': token_record['_id']},
                {'$set': {'revoked': True}}
            )
            
            # Create new tokens
            new_access_token = create_access_token(user)
            new_refresh_token = create_refresh_token(user)
            
            # Store new refresh token in database
            refresh_tokens_collection.insert_one({
                'user_id': user['_id'],
                'token': new_refresh_token,
                'created_at': int(time.time() * 1000),
                'revoked': False
            })
            
            return JsonResponse({
                'success': True,
                'data': {
                    'access': new_access_token,
                    'refresh': new_refresh_token
                }
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh')
            
            if not refresh_token:
                return JsonResponse({'success': False, 'error': {'message': 'Refresh token is required'}}, status=400)
            
            # Revoke the refresh token in the database
            refresh_tokens_collection = db['refresh_tokens']
            result = refresh_tokens_collection.update_one(
                {'token': refresh_token},
                {'$set': {'revoked': True}}
            )
            
            if result.matched_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Refresh token not found'}}, status=404)
            
            return JsonResponse({'success': True, 'message': 'Logged out successfully'})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
