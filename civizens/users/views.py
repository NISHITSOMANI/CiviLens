from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import get_user_model, logout
from django.contrib.auth.hashers import make_password
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer, ProfileSerializer

User = get_user_model()

class LoginView(ObtainAuthToken):
    """
    User login view that returns an authentication token
    """
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username
        })

class RegisterView(generics.CreateAPIView):
    """
    User registration view
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def perform_create(self, serializer):
        # Hash password before saving
        password = make_password(serializer.validated_data['password'])
        serializer.save(password=password)

class LogoutView(APIView):
    """
    User logout view that deletes the authentication token
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Delete the token to force login
        request.user.auth_token.delete()
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update user profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        # Handle partial updates
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Don't allow updating password through this endpoint
        if 'password' in request.data:
            return Response(
                {"password": ["Password cannot be updated here. Use the password reset endpoint."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

class UserListView(generics.ListAPIView):
    """
    List all users (admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
