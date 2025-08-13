from djongo import models

class Scheme(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    region = models.CharField(max_length=100)
    target_audience = models.CharField(max_length=255)
    prediction_score = models.FloatField()
    sentiment_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    