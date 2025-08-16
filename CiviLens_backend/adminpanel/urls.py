from django.urls import path
from .views import AdminUsersView, AdminUserDetailView, AdminStatsView

urlpatterns = [
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('users/<str:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
