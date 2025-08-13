from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Avg, F, Max, Min
from .models import SentimentRecord
from .serializers import SentimentRecordSerializer, SentimentOverviewSerializer, RegionSentimentSerializer

class SentimentOverviewView(APIView):
    """
    Provides an overview of sentiment analysis across all regions
    """
    def get(self, request, *args, **kwargs):
        # Get overall sentiment statistics
        total_records = SentimentRecord.objects.count()
        avg_sentiment = SentimentRecord.objects.aggregate(
            avg_sentiment=Avg('sentiment_score')
        )['avg_sentiment'] or 0
        
        # Get sentiment distribution by region
        region_stats = SentimentRecord.objects.values('region').annotate(
            record_count=Count('id'),
            avg_sentiment=Avg('sentiment_score')
        )
        
        data = {
            'total_records': total_records,
            'average_sentiment': avg_sentiment,
            'region_stats': region_stats,
            'sentiment_distribution': {
                'positive': SentimentRecord.objects.filter(sentiment_score__gt=0.2).count(),
                'neutral': SentimentRecord.objects.filter(sentiment_score__gte=-0.2, sentiment_score__lte=0.2).count(),
                'negative': SentimentRecord.objects.filter(sentiment_score__lt=-0.2).count(),
            }
        }
        
        serializer = SentimentOverviewSerializer(data)
        return Response(serializer.data)

class SentimentByRegionView(APIView):
    """
    Provides detailed sentiment analysis for a specific region
    """
    def get(self, request, region, *args, **kwargs):
        # Get sentiment records for the specified region
        queryset = SentimentRecord.objects.filter(region__iexact=region)
        
        if not queryset.exists():
            return Response(
                {'error': f'No sentiment data found for region: {region}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate statistics for the region
        stats = queryset.aggregate(
            total_records=Count('id'),
            avg_sentiment=Avg('sentiment_score'),
            max_sentiment=Max('sentiment_score'),
            min_sentiment=Min('sentiment_score')
        )
        
        # Get sentiment distribution by category
        category_stats = queryset.values('category').annotate(
            count=Count('id'),
            avg_sentiment=Avg('sentiment_score')
        )
        
        data = {
            'region': region,
            'total_records': stats['total_records'],
            'average_sentiment': stats['avg_sentiment'],
            'sentiment_range': {
                'max': stats['max_sentiment'],
                'min': stats['min_sentiment']
            },
            'by_category': category_stats,
            'recent_records': SentimentRecordSerializer(
                queryset.order_by('-created_at')[:10],
                many=True
            ).data
        }
        
        serializer = RegionSentimentSerializer(data)
        return Response(serializer.data)
