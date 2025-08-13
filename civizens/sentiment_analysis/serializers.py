from rest_framework import serializers
from .models import SentimentRecord

class SentimentRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for the SentimentRecord model
    """
    class Meta:
        model = SentimentRecord
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'sentiment_score': {'required': True},
            'text': {'required': True, 'allow_blank': False},
            'source': {'required': False},
            'region': {'required': False}
        }

class SentimentOverviewSerializer(serializers.Serializer):
    """
    Serializer for sentiment overview data
    """
    total_records = serializers.IntegerField()
    average_sentiment = serializers.FloatField()
    sentiment_distribution = serializers.DictField(
        child=serializers.IntegerField()
    )
    region_stats = serializers.ListField(
        child=serializers.DictField(
            child=serializers.FloatField(),
            allow_empty=True
        )
    )

class RegionSentimentSerializer(serializers.Serializer):
    """
    Serializer for region-specific sentiment data
    """
    region = serializers.CharField()
    total_records = serializers.IntegerField()
    average_sentiment = serializers.FloatField()
    sentiment_range = serializers.DictField(
        child=serializers.FloatField()
    )
    by_category = serializers.ListField(
        child=serializers.DictField(
            child=serializers.FloatField(),
            allow_empty=True
        )
    )
    recent_records = serializers.ListField(
        child=serializers.DictField()
    )

# For backward compatibility
SentimentSerializer = SentimentRecordSerializer
