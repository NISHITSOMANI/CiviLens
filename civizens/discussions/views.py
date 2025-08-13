from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .models import Discussion
from .serializers import DiscussionSerializer

class DiscussionListCreateView(generics.ListCreateAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer

class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer

class CommentListCreateView(APIView):
    def get(self, request, pk):
        return Response({"message": f"Comments for discussion {pk}"})
    
    def post(self, request, pk):
        return Response({"message": f"Add comment to discussion {pk}"})