from django.urls import path
from .views import RegisterView, LoginView, ProfileView, RefreshTokenView, LogoutView
from .mongodb_views import log_user_activity, get_user_analytics

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('log-activity/', log_user_activity, name='log_user_activity'),
    path('analytics/', get_user_analytics, name='get_user_analytics'),
]
