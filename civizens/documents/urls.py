from django.urls import path
from . import views

urlpatterns = [
    # List and create documents
    path('', views.DocumentListCreateView.as_view(), name='document-list'),
    
    # Document upload endpoint
    path('upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    
    # Document detail, update, delete
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
]
