import json
from django.views import View
from django.http import JsonResponse
from .models import ChatMessage

class ChatView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            msg = data.get('message', '')
            # Placeholder AI response logic
            resp = f"AI placeholder echo: {msg}"
            cm = ChatMessage.objects.create(user=getattr(request, 'user', None) if getattr(request, 'user', None) and request.user.is_authenticated else None, user_message=msg, bot_response=resp)
            return JsonResponse({'success': True, 'data': {'response': resp}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
