import jwt
import datetime
from django.conf import settings
from django.utils import timezone

def create_access_token(user):
    payload = {
        'user_id': str(user.id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME),
        'iat': datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def create_refresh_token(user):
    payload = {
        'user_id': str(user.id),
        'type': 'refresh',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_LIFETIME_DAYS),
        'iat': datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None
