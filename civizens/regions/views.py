from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Region, RegionInsight
from .serializers import RegionSerializer, RegionInsightSerializer

# Views for Region model
class RegionListView(generics.ListAPIView):
    """List all regions"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class RegionDetailView(generics.RetrieveAPIView):
    """Retrieve details for a specific region"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    lookup_field = 'name'  # Using name as the lookup field as per URL pattern
    lookup_url_kwarg = 'region'  # Matches the URL pattern <str:region>/

# Views for RegionInsight model (keeping existing functionality)
class RegionInsightListCreateView(generics.ListCreateAPIView):
    """List all region insights or create a new one"""
    queryset = RegionInsight.objects.all()
    serializer_class = RegionInsightSerializer

class RegionInsightDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a region insight"""
    queryset = RegionInsight.objects.all()
    serializer_class = RegionInsightSerializer
