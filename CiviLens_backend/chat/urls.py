from django.urls import path
from .views import ChatView, ChatMessagesView, CategoriesView

urlpatterns = [
    path('', ChatView.as_view(), name='chat'),
    path('messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('categories/', CategoriesView.as_view(), name='chat-categories'),
]
