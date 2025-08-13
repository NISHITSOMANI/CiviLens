from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Region(models.Model):
    """
    Model representing a geographical region
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    population = models.PositiveIntegerField(blank=True, null=True)
    area_sq_km = models.FloatField(blank=True, null=True, help_text="Area in square kilometers")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Region'
        verbose_name_plural = 'Regions'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class RegionInsight(models.Model):
    """
    Model for storing insights and analytics about a region
    """
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='insights'
    )
    top_schemes = models.JSONField(
        help_text="Top schemes in this region with their metrics"
    )
    sentiment_avg = models.FloatField(
        help_text="Average sentiment score (-1 to 1)"
    )
    complaints_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of complaints in this region"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Region Insight'
        verbose_name_plural = 'Region Insights'

    def __str__(self):
        return f"{self.region.name} - {self.created_at.strftime('%Y-%m-%d')}"
