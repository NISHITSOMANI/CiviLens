from rest_framework import serializers
from .models import Region, RegionInsight

class RegionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Region model
    """
    class Meta:
        model = Region
        fields = [
            'id', 'name', 'slug', 'description', 
            'population', 'area_sq_km', 'created_at', 'updated_at'
        ]
        read_only_fields = ('slug', 'created_at', 'updated_at')
        extra_kwargs = {
            'name': {'required': True, 'allow_blank': False},
            'description': {'required': False, 'allow_blank': True},
        }

    def validate_name(self, value):
        """Ensure region name is unique (case-insensitive)"""
        if Region.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A region with this name already exists.")
        return value

class RegionInsightSerializer(serializers.ModelSerializer):
    """
    Serializer for the RegionInsight model
    """
    region = RegionSerializer(read_only=True)
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        write_only=True,
        source='region'
    )
    
    class Meta:
        model = RegionInsight
        fields = [
            'id', 'region', 'region_id', 'top_schemes', 
            'sentiment_avg', 'complaints_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'sentiment_avg': {'min_value': -1.0, 'max_value': 1.0},
            'complaints_count': {'min_value': 0},
        }

    def validate_top_schemes(self, value):
        """Validate the structure of top_schemes JSON field"""
        if not isinstance(value, list):
            raise serializers.ValidationError("top_schemes must be a list")
        
        for scheme in value:
            if not isinstance(scheme, dict):
                raise serializers.ValidationError("Each scheme must be an object")
            if 'name' not in scheme or not scheme['name']:
                raise serializers.ValidationError("Each scheme must have a 'name' field")
            
        return value
