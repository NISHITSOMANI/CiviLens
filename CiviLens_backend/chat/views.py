import json
import time
import os
import re
import google.generativeai as genai
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

            # System prompt: require direct, high-quality answers only
            system_prompt = (
                "You are CiviLens AI Assistant. Answer directly and helpfully about Indian government schemes and civic services. "
                "Follow these rules strictly:\n"
                "- Do NOT use disclaimers or hedging (no 'I cannot provide' or 'as an AI').\n"
                "- Prefer concise lists of 5–8 items when listing schemes.\n"
                "- For each scheme include: bold name, 1-line summary, key eligibility, main benefit, and an official link if confidently known.\n"
                "- Keep sentences short; professional, neutral tone; no emojis unless the user asks.\n"
                "- If a specific item is unknown, omit it rather than guessing; never fabricate links.\n"
                "- Keep total length about 180–220 words unless the user asks for more.\n"
            )

            # LLM response via Google Gemini; fall back to Mongo if unavailable/errors
            debug_info = None
            resp_text = ''

            # Local Mongo fallback: richer search over multiple fields with tokenization and category hints
            def mongo_fallback(user_query: str) -> str:
                try:
                    query_text = (user_query or '').strip()
                    if not query_text:
                        return "I'm not sure."
                    names = db.list_collection_names()
                    if 'schemes' in names:
                        col = db['schemes']
                    elif 'gov_schemes' in names:
                        col = db['gov_schemes']
                    else:
                        return "I'm not sure."

                    # Detect common categories from quick chips
                    lower_q = query_text.lower()
                    category_hints = {
                        'education': ['education', 'student', 'students', 'scholarship', 'school', 'college', 'tuition', 'scholarships'],
                        'health': ['health', 'healthcare', 'medical', 'hospital', 'insurance'],
                        'agriculture': ['agriculture', 'farmer', 'farmers', 'crop', 'kisan'],
                        'pension': ['pension', 'old age', 'retirement'],
                        'women': ['women', 'girls', 'female', 'ladki', 'mahila'],
                        'housing': ['housing', 'house', 'home', 'pmay', 'awas'],
                        'startup': ['startup', 'entrepreneur', 'business', 'msme'],
                    }
                    cat_filter_pattern = None
                    for _, keywords in category_hints.items():
                        if any(k in lower_q for k in keywords):
                            # Use a broad regex that matches any of the keywords for that category
                            escaped = [re.escape(k) for k in keywords]
                            cat_filter_pattern = "(" + "|".join(escaped) + ")"
                            break

                    # Tokenize into words (min length 3)
                    tokens = [t for t in re.findall(r"[A-Za-z0-9]+", lower_q) if len(t) >= 3]
                    # Fields to search across
                    text_fields = [
                        'name', 'scheme_name', 'title',
                        'description', 'description_long', 'summary', 'details', 'highlights',
                        'benefits', 'benefit', 'eligibility', 'objective', 'objectives', 'how_to_apply',
                        'category', 'categoryName', 'department', 'department_name', 'ministry', 'ministry_name',
                        'state', 'state_name', 'tags',
                        'url', 'link', 'scheme_url'
                    ]

                    # Build query: AND over tokens, where each token matches OR over fields (regex i)
                    and_clauses = []
                    for tok in tokens or [lower_q]:
                        or_clauses = []
                        for f in text_fields:
                            if f == 'tags':
                                or_clauses.append({'tags': {'$elemMatch': {'$regex': tok, '$options': 'i'}}})
                                or_clauses.append({'tags': {'$regex': tok, '$options': 'i'}})
                            else:
                                or_clauses.append({f: {'$regex': tok, '$options': 'i'}})
                        and_clauses.append({'$or': or_clauses})

                    mongo_query = {'$and': and_clauses} if and_clauses else {}
                    if cat_filter_pattern:
                        mongo_query = {
                            '$and': [
                                mongo_query if mongo_query else {},
                                {'$or': [
                                    {'category': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                    {'categoryName': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                ]}
                            ]
                        }

                    projection = {
                        '_id': 0,
                        'name': 1, 'scheme_name': 1, 'title': 1,
                        'url': 1, 'link': 1, 'scheme_url': 1,
                        'category': 1, 'categoryName': 1,
                        'benefits': 1, 'eligibility': 1,
                    }
                    docs = list(col.find(mongo_query, projection=projection).limit(10))

                    # If strict AND search yields nothing, relax to OR-over-tokens search
                    if not docs and tokens:
                        or_clauses_outer = []
                        for tok in tokens:
                            inner_or = []
                            for f in text_fields:
                                if f == 'tags':
                                    inner_or.append({'tags': {'$elemMatch': {'$regex': tok, '$options': 'i'}}})
                                    inner_or.append({'tags': {'$regex': tok, '$options': 'i'}})
                                else:
                                    inner_or.append({f: {'$regex': tok, '$options': 'i'}})
                            or_clauses_outer.append({'$or': inner_or})
                        relaxed_query = {'$or': or_clauses_outer}
                        if cat_filter_pattern:
                            relaxed_query = {
                                '$and': [
                                    relaxed_query,
                                    {'$or': [
                                        {'category': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                        {'categoryName': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                    ]}
                                ]
                            }
                        docs = list(col.find(relaxed_query, projection=projection).limit(10))

                    # If nothing found, try a simpler category-only search
                    if not docs and cat_filter_pattern:
                        simple_q = {'$or': [
                            {'category': {'$regex': cat_filter_pattern, '$options': 'i'}},
                            {'categoryName': {'$regex': cat_filter_pattern, '$options': 'i'}},
                        ]}
                        docs = list(col.find(simple_q, projection=projection).limit(10))

                    if not docs:
                        # Try popular/recency fallback
                        try:
                            sort_key = 'created_at' if col.find_one({'created_at': {'$exists': True}}) else None
                            base_filter = {}
                            if cat_filter_pattern:
                                base_filter = {'$or': [
                                    {'category': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                    {'categoryName': {'$regex': cat_filter_pattern, '$options': 'i'}},
                                ]}
                            cursor = col.find(base_filter, projection=projection)
                            if sort_key:
                                cursor = cursor.sort(sort_key, -1)
                            docs = list(cursor.limit(10))
                        except Exception:
                            docs = []
                        if not docs:
                            return "I couldn't find any schemes for that query. Try a different keyword or pick a Quick Ask category."

                    lines = ["Here are some relevant schemes:"]
                    for i, d in enumerate(docs, 1):
                        name = d.get('name') or d.get('scheme_name') or d.get('title') or 'Unknown'
                        url = d.get('url') or d.get('link') or d.get('scheme_url') or ''
                        cat = d.get('category') or d.get('categoryName')
                        extra = []
                        elig = d.get('eligibility')
                        bens = d.get('benefits')
                        if elig and isinstance(elig, str):
                            extra.append(f"Eligibility: {elig[:120]}{'…' if len(elig) > 120 else ''}")
                        if bens and isinstance(bens, str):
                            extra.append(f"Benefits: {bens[:120]}{'…' if len(bens) > 120 else ''}")
                        base = f"{i}. {name}"
                        if url:
                            base += f" - {url}"
                        if cat:
                            base += f" (category: {cat})"
                        lines.append(base)
                        if extra:
                            lines.append("   - " + " | ".join(extra))
                    return "\n".join(lines)
                except Exception:
                    return "I'm not sure."

            # Try Gemini first; on auth/quota/network/model errors -> fallback to Mongo
            gemini_key = os.environ.get('GEMINI_API_KEY')
            if not gemini_key:
                resp_text = mongo_fallback(msg)
            else:
                try:
                    genai.configure(api_key=gemini_key)
                    model_name = os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash')
                    model = genai.GenerativeModel(model_name=model_name, system_instruction=system_prompt)
                    result = model.generate_content(msg)
                    text = getattr(result, 'text', None)
                    # Some SDK versions return a response object with candidates/parts; handle defensively
                    if not text and hasattr(result, 'candidates'):
                        try:
                            parts = result.candidates[0].content.parts
                            text = "".join(getattr(p, 'text', '') for p in parts)
                        except Exception:
                            text = None
                    resp_text = (text or '').strip() or "I'm not sure."
                except Exception as e:
                    if getattr(settings, 'DEBUG', False):
                        debug_info = f'gemini_error: {str(e)}'
                    # Fallback to Mongo results
                    resp_text = mongo_fallback(msg)

            # Classic path removed; single integration now uses Gemini with Mongo fallback

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


@method_decorator(csrf_exempt, name='dispatch')
class CategoriesView(View):
    def get(self, request):
        try:
            names = db.list_collection_names()
            if 'schemes' in names:
                col = db['schemes']
            elif 'gov_schemes' in names:
                col = db['gov_schemes']
            else:
                return JsonResponse({'success': True, 'data': []})

            # Collect distinct values for category keys
            cats_a = col.distinct('category')
            cats_b = col.distinct('categoryName')
            raw = [*(cats_a or []), *(cats_b or [])]
            # Normalize, dedupe (case-insensitive), and sort
            seen = set()
            cleaned = []
            for c in raw:
                if not c or not isinstance(c, str):
                    continue
                s = c.strip()
                if not s:
                    continue
                key = s.lower()
                if key in seen:
                    continue
                seen.add(key)
                cleaned.append(s)
            cleaned.sort(key=lambda x: x.lower())

            return JsonResponse({'success': True, 'data': cleaned})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
