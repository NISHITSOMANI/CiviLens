import json
from django.views import View
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import RefreshToken
from core.jwt_utils import create_access_token, create_refresh_token, decode_token

User = get_user_model()

class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role', 'user')
            user = User.objects.create_user(username=username, email=email, password=password)
            user.role = role
            user.save()
            access = create_access_token(user)
            refresh = create_refresh_token(user)
            RefreshToken.objects.create(user=user, token=refresh)
            return JsonResponse({'success': True, 'data': {'access': access, 'refresh': refresh}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is None:
                return JsonResponse({'success': False, 'error': {'message':'Invalid credentials'}}, status=401)
            access = create_access_token(user)
            refresh = create_refresh_token(user)
            RefreshToken.objects.create(user=user, token=refresh)
            return JsonResponse({'success': True, 'data': {'access': access, 'refresh': refresh, 'user': {'id': user.id, 'username': user.username, 'role': user.role}}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class ProfileView(View):
    def get(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return JsonResponse({'success': False, 'error': {'message':'Authentication required'}}, status=401)
        return JsonResponse({'success': True, 'data': {'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}})
