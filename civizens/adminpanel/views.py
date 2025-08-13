from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import AdminUserSerializer

User = get_user_model()

class AdminDashboardView(TemplateView):
    template_name = 'adminpanel/dashboard.html'

class UserManagementView(TemplateView):
    template_name = 'adminpanel/user_management.html'

class AnalyticsView(TemplateView):
    template_name = 'adminpanel/analytics.html'

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
