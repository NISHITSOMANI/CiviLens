from django.urls import path
from . import views

urlpatterns = [
    path('', views.SentimentOverviewView.as_view(), name='sentiment-overview'),
    path('<str:region>/', views.SentimentByRegionView.as_view(), name='sentiment-by-region'),
]
