from django.urls import path
from . import views

urlpatterns = [
    path('', views.SchemeListView.as_view(), name='scheme-list'),
    path('<int:pk>/', views.SchemeDetailView.as_view(), name='scheme-detail'),
    path('search/', views.SchemeSearchView.as_view(), name='scheme-search'),
]
