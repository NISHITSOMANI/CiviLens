from djongo import models
from django.conf import settings

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_message = models.TextField()
    bot_response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
