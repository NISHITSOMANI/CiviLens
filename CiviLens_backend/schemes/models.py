from djongo import models

class Scheme(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True)
    region = models.CharField(max_length=100, blank=True)
    categories = models.JSONField(default=list)
    target_audience = models.CharField(max_length=255, blank=True)
    budget = models.FloatField(null=True, blank=True)
    prediction_score = models.FloatField(null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
