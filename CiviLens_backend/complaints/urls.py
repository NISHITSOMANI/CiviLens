from django.urls import path
from .views import ComplaintListCreateView, ComplaintDetailView, ComplaintUpvoteView

urlpatterns = [
    path('', ComplaintListCreateView.as_view(), name='complaint-list'),
    path('<str:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<str:pk>/upvote/', ComplaintUpvoteView.as_view(), name='complaint-upvote'),
]
