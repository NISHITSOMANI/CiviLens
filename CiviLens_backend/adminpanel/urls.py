from django.urls import path
from .views import (
    AdminUsersView,
    AdminUserDetailView,
    AdminStatsView,
    AdminHeatmapView,
    AdminSentimentTrendsView,
    AdminRiskySchemesView,
    AdminSuccessPredictionView,
    AdminComplaintsListView,
    AdminComplaintsHeatmapView,
)

urlpatterns = [
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('users/<str:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    # Analytics
    path('analytics/heatmap/', AdminHeatmapView.as_view(), name='admin-heatmap'),
    path('analytics/sentiment/', AdminSentimentTrendsView.as_view(), name='admin-sentiment-trends'),
    path('analytics/schemes/risk/', AdminRiskySchemesView.as_view(), name='admin-risky-schemes'),
    path('analytics/schemes/success/', AdminSuccessPredictionView.as_view(), name='admin-success-prediction'),
    # Complaints (admin)
    path('complaints/', AdminComplaintsListView.as_view(), name='admin-complaints-list'),
    path('complaints/heatmap/', AdminComplaintsHeatmapView.as_view(), name='admin-complaints-heatmap'),
]
