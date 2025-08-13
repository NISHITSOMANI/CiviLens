from djongo import models

class Complaint(models.Model):
    description = models.TextField()
    region = models.CharField(max_length=100)
    urgency = models.IntegerField()
    topic = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
