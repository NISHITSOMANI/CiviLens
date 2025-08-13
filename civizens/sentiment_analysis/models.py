from djongo import models

class SentimentRecord(models.Model):
    scheme_name = models.CharField(max_length=255)
    region = models.CharField(max_length=100)
    sentiment_score = models.FloatField()
    emotion = models.CharField(max_length=50)
    date = models.DateField()
