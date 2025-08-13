from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatLog
from .serializers import ChatLogSerializer

class ChatLogListCreateView(generics.ListCreateAPIView):
    queryset = ChatLog.objects.all()
    serializer_class = ChatLogSerializer

class ChatLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatLog.objects.all()
    serializer_class = ChatLogSerializer

class ChatbotResponseView(APIView):
    def post(self, request, *args, **kwargs):
        # Get user message from request
        user_message = request.data.get('message', '')
        
        # Here you would typically process the message with your chatbot logic
        # For now, we'll just echo the message back
        response_message = f"You said: {user_message}"
        
        # Log the conversation
        chat_log = ChatLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            message=user_message,
            response=response_message
        )
        
        return Response({
            'response': response_message,
            'timestamp': chat_log.timestamp
        }, status=status.HTTP_200_OK)
