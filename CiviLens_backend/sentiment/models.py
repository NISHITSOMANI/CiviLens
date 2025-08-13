from djongo import models

class SentimentRecord(models.Model):
    source = models.CharField(max_length=100, blank=True)
    text = models.TextField()
    scheme_id = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    polarity = models.FloatField(null=True, blank=True)
    emotion = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
