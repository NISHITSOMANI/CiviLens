from django.urls import path
from . import views

urlpatterns = [
    path('', views.DiscussionListCreateView.as_view(), name='discussion-list'),  # List all or create
    path('<int:pk>/', views.DiscussionDetailView.as_view(), name='discussion-detail'),  # View single
    path('<int:pk>/comments/', views.CommentListCreateView.as_view(), name='discussion-comments'),  # Comments
]
