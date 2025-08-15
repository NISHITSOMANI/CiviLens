import jwt
import datetime
from django.conf import settings
from django.utils import timezone

def create_access_token(user):
    # For MongoDB documents, user ID is stored in '_id' field
    user_id = str(user['_id']) if isinstance(user, dict) else str(user.id)
    
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def create_refresh_token(user):
    # For MongoDB documents, user ID is stored in '_id' field
    user_id = str(user['_id']) if isinstance(user, dict) else str(user.id)
    
    payload = {
        'user_id': user_id,
        'type': 'refresh',
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=settings.REFRESH_TOKEN_LIFETIME_DAYS),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None
