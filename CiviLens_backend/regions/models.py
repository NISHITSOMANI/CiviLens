from djongo import models

class RegionInsight(models.Model):
    region_name = models.CharField(max_length=100)
    complaints_count = models.IntegerField(default=0)
    avg_sentiment = models.FloatField(null=True, blank=True)
    top_schemes = models.JSONField(default=list)
    last_updated = models.DateTimeField(auto_now=True)
