from djongo import models
from django.conf import settings

class Complaint(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    region = models.CharField(max_length=100)
    topic = models.CharField(max_length=100, blank=True)
    urgency = models.IntegerField(default=3)
    status = models.CharField(max_length=50, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    geo = models.JSONField(default=dict)
