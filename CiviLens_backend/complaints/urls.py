from django.urls import path
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintUpvoteView, ComplaintHeatmapView

urlpatterns = [
    path('', ComplaintListCreateView.as_view(), name='complaint-list'),
    path('heatmap/', ComplaintHeatmapView.as_view(), name='complaint-heatmap'),
    path('<str:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<str:pk>/upvote/', ComplaintUpvoteView.as_view(), name='complaint-upvote'),
]
