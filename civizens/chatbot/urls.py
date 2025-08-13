from django.urls import path
from . import views

urlpatterns = [
    # Chatbot interaction endpoint
    path('', views.ChatbotResponseView.as_view(), name='chatbot'),
    
    # Chat log endpoints
    path('logs/', views.ChatLogListCreateView.as_view(), name='chatlog-list'),
    path('logs/<int:pk>/', views.ChatLogDetailView.as_view(), name='chatlog-detail'),
]
