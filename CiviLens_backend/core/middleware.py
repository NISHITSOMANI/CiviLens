import time
import jwt
from django.conf import settings
from django.http import JsonResponse

# Very simple JWT auth middleware (decodes token and sets request.user_data if valid)
class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                # Get user data from MongoDB instead of Django models
                from db_connection import db
                try:
                    # Convert string user_id from token to ObjectId for MongoDB query
                    from bson import ObjectId
                    user_data = db['users'].find_one({'_id': ObjectId(payload.get('user_id'))})
                    if user_data:
                        # Convert ObjectId to string for consistency
                        user_data['_id'] = str(user_data['_id'])
                        request.user_data = user_data
                except Exception:
                    request.user_data = None
            except Exception:
                request.user_data = None
        return self.get_response(request)

# Simple in-memory rate limiter (for development only)
class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.store = {}

    def __call__(self, request):
        # naive implementation: limit by path and remote addr
        key = f"{request.path}:{request.META.get('REMOTE_ADDR')}"
        now = time.time()
        window = 60
        limit = 200
        hits = [t for t in self.store.get(key, []) if now - t < window]
        hits.append(now)
        self.store[key] = hits
        if len(hits) > limit:
            return JsonResponse({'success': False, 'error': {'message': 'Rate limit exceeded', 'code':429}}, status=429)
        return self.get_response(request)
