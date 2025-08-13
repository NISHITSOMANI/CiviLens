import time
import jwt
from django.conf import settings
from django.http import JsonResponse

# Very simple JWT auth middleware (decodes token and sets request.user if valid)
class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                from django.contrib.auth import get_user_model
                User = get_user_model()
                try:
                    request.user = User.objects.get(id=payload.get('user_id'))
                except Exception:
                    request.user = None
            except Exception:
                request.user = None
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
