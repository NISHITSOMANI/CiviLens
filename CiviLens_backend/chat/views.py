import json
import time
import os
import requests
from django.views import View
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')

class ChatView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            msg = data.get('message', '')
            if not isinstance(msg, str) or not msg.strip():
                return JsonResponse({'success': False, 'error': {'message': 'Message cannot be empty'}}, status=400)
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            if not user_data:
                return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)
            
            # Get collection and persistence flag
            chat_messages_collection = db['chat_messages']
            persist_enabled = os.environ.get('CHAT_PERSIST', '0') == '1'
            
            # Persist user message (only if enabled)
            if persist_enabled:
                user_doc = {
                    'role': 'user',
                    'content': msg,
                    'created_at': int(time.time() * 1000),
                    'user_id': str(user_data['_id']),
                }
                chat_messages_collection.insert_one(user_doc)

            # Build minimal system prompt for domain safety
            system_prompt = (
                "You are CiviLens Assistant specializing in Indian government schemes. "
                "Answer concisely and factually. If the question is outside this domain or "
                "you do not have enough information, say you don't know."
            )

            # Use only the HF Router (OpenAI-compatible). This avoids classic API 404s.
            use_router = True
            debug_info = None
            resp_text = ''

            if use_router:
                # Use OpenAI-compatible client against HF Router
                # Requires: pip install openai>=1.0.0
                hf_token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_API_KEY')
                if not hf_token:
                    raise Exception('HF_TOKEN/HUGGINGFACE_API_KEY not configured on server')
                try:
                    from openai import OpenAI
                    client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=hf_token)
                    # Default to a widely accessible public model; override via HF_CHAT_MODEL
                    model_name = os.environ.get('HF_CHAT_MODEL', 'HuggingFaceH4/zephyr-7b-beta')
                    # Build messages with a system prompt + user
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": msg},
                    ]
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.3,
                        max_tokens=400,
                    )
                    resp_text = (completion.choices[0].message.content or '').strip()
                except Exception as e:
                    if getattr(settings, 'DEBUG', False):
                        debug_info = f'router_error: {str(e)}'
                    # Do not fall back to classic path; keep a single code path
                    resp_text = "I'm not sure."

            # Classic path removed to ensure a single stable integration

            # Persist assistant message (only if enabled)
            if persist_enabled:
                bot_doc = {
                    'role': 'assistant',
                    'content': resp_text,
                    'created_at': int(time.time() * 1000),
                    'user_id': str(user_data['_id']),
                }
                chat_messages_collection.insert_one(bot_doc)

            data = {'response': resp_text, 'persist': persist_enabled}
            if debug_info and getattr(settings, 'DEBUG', False):
                data['debug'] = debug_info
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ChatMessagesView(View):
    def get(self, request):
        try:
            user_data = getattr(request, 'user_data', None)
            if not user_data:
                return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)
            persist_enabled = os.environ.get('CHAT_PERSIST', '0') == '1'
            if not persist_enabled:
                # Persistence disabled: always return empty history
                return JsonResponse({'success': True, 'data': []})
            chat_messages_collection = db['chat_messages']
            query = {'user_id': str(user_data['_id'])}
            # Return last 50 messages sorted by time
            cursor = chat_messages_collection.find(query, projection={'_id': 1, 'role': 1, 'content': 1, 'created_at': 1}).sort('created_at', 1).limit(50)
            messages = []
            for m in cursor:
                messages.append({
                    'id': str(m.get('_id')),
                    'role': m.get('role', 'assistant' if 'bot_response' in m else 'user'),
                    'content': m.get('content') or m.get('user_message') or m.get('bot_response') or '',
                    'timestamp': m.get('created_at'),
                })
            return JsonResponse({'success': True, 'data': messages})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
