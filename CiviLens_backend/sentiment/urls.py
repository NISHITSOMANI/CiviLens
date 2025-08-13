from django.urls import path
from .views import SentimentOverviewView

urlpatterns = [
    path('overview/', SentimentOverviewView.as_view(), name='sentiment-overview'),
]
