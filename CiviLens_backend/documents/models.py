from djongo import models
from django.conf import settings

class Document(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    extracted_text = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    language = models.CharField(max_length=20, default='en')
    uploaded_at = models.DateTimeField(auto_now_add=True)
