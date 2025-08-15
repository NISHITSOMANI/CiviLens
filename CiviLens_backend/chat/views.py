import json
import time
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')

class ChatView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            msg = data.get('message', '')
            # Placeholder AI response logic
            resp = f"AI placeholder echo: {msg}"
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            
            # Get collection
            chat_messages_collection = db['chat_messages']
            
            # Create chat message document
            chat_message_doc = {
                'user_message': msg,
                'bot_response': resp,
                'created_at': int(time.time() * 1000)  # Store as timestamp
            }
            
            # Add user reference if available
            if user_data:
                chat_message_doc['user_id'] = str(user_data['_id'])
            
            # Insert chat message
            result = chat_messages_collection.insert_one(chat_message_doc)
            
            return JsonResponse({'success': True, 'data': {'response': resp}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
