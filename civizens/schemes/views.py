from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Scheme
from .serializers import SchemeSerializer

class SchemeListView(generics.ListAPIView):
    """List all schemes with optional filtering"""
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'launch_date', 'last_date']

class SchemeDetailView(generics.RetrieveAPIView):
    """Retrieve details of a specific scheme"""
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer

class SchemeSearchView(APIView):
    """Advanced search for schemes with multiple filter criteria"""
    def get(self, request, *args, **kwargs):
        queryset = Scheme.objects.all()
        
        # Get query parameters
        search_term = request.query_params.get('q', '')
        category = request.query_params.get('category')
        min_age = request.query_params.get('min_age')
        max_age = request.query_params.get('max_age')
        
        # Apply filters
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(eligibility_criteria__icontains=search_term)
            )
            
        if category:
            queryset = queryset.filter(category__iexact=category)
            
        if min_age:
            queryset = queryset.filter(min_age__lte=min_age)
            
        if max_age:
            queryset = queryset.filter(max_age__gte=max_age)
        
        # Serialize and return results
        serializer = SchemeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
