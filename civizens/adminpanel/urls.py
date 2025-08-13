from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('users/', views.UserManagementView.as_view(), name='user-management'),
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
]
