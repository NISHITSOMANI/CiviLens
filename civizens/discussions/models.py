from djongo import models

class Discussion(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
