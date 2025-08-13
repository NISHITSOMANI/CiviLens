from django.urls import path
from .views import DiscussionListCreateView, DiscussionDetailView, CommentCreateView

urlpatterns = [
    path('', DiscussionListCreateView.as_view(), name='discussions'),
    path('<str:pk>/', DiscussionDetailView.as_view(), name='discussion-detail'),
    path('<str:pk>/comments/', CommentCreateView.as_view(), name='discussion-comments'),
]
