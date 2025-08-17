from django.urls import path
from .views import ChatView, ChatMessagesView

urlpatterns = [
    path('', ChatView.as_view(), name='chat'),
    path('messages/', ChatMessagesView.as_view(), name='chat-messages'),
]
