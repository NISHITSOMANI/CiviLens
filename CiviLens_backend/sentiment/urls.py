from django.urls import path
from .views import SentimentOverviewView, SentimentRegionsView

urlpatterns = [
    path('overview/', SentimentOverviewView.as_view(), name='sentiment-overview'),
    path('regions/', SentimentRegionsView.as_view(), name='sentiment-regions'),
]
