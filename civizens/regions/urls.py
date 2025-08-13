from django.urls import path
from . import views

urlpatterns = [
    # Region endpoints
    path('', views.RegionListView.as_view(), name='region-list'),
    path('<str:region>/', views.RegionDetailView.as_view(), name='region-detail'),
    
    # Region insight endpoints
    path('insights/', views.RegionInsightListCreateView.as_view(), name='region-insight-list'),
    path('insights/<int:pk>/', views.RegionInsightDetailView.as_view(), name='region-insight-detail'),
]
