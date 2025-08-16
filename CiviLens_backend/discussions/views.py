import json
import time
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db
from bson import ObjectId

@method_decorator(csrf_exempt, name='dispatch')

class DiscussionListCreateView(View):
    def get(self, request):
        # Get collection
        discussions_collection = db['discussions']
        
        # Get all discussions and project fields
        docs = list(discussions_collection.find({}))

        # Map to frontend-expected shape with sensible defaults
        results = []
        for d in docs:
            results.append({
                'id': str(d.get('_id')),
                'title': d.get('title') or '',
                'content': d.get('content') or '',
                'category': d.get('category') or 'General',
                'tags': d.get('tags') or [],
                'author': d.get('created_by') or 'anonymous',
                # Frontend expects a date string; convert ms timestamp if present
                'date': d.get('created_at'),
                'comments': int(d.get('comments', 0)),
                'likes': int(d.get('likes', 0)),
            })

        return JsonResponse({'success': True, 'data': results})

    def post(self, request):
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            created_by = user_data['username'] if user_data else 'anonymous'
            
            # Get collection
            discussions_collection = db['discussions']
            
            # Create discussion document
            discussion_doc = {
                'title': title,
                'content': content,
                'created_by': created_by,
                'created_at': int(time.time() * 1000),  # Store as timestamp (ms)
                # Optional fields used by UI
                'category': data.get('category') or 'General',
                'tags': data.get('tags') or [],
                'comments': 0,
                'likes': 0,
            }
            
            # Insert discussion
            result = discussions_collection.insert_one(discussion_doc)
            
            return JsonResponse({'success': True, 'data': {
                'id': str(result.inserted_id)
            }})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class DiscussionDetailView(View):
    def get(self, request, pk):
        try:
            # Get collections
            discussions_collection = db['discussions']
            comments_collection = db['comments']
            
            # Find discussion by ID
            discussion = discussions_collection.find_one({'_id': ObjectId(pk)})
            
            if not discussion:
                return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
            
            # Convert ObjectId to string for JSON serialization and prepare comments
            comments = list(comments_collection.find({'discussion_id': pk}, {'_id': 0}))

            data = {
                'id': str(discussion.get('_id')),
                'title': discussion.get('title') or '',
                'content': discussion.get('content') or '',
                'category': discussion.get('category') or 'General',
                'tags': discussion.get('tags') or [],
                'author': discussion.get('created_by') or 'anonymous',
                'date': discussion.get('created_at'),
                'comments': comments,
                'likes': int(discussion.get('likes', 0)),
            }
            
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class CommentCreateView(View):
    def post(self, request, pk):
        try:
            data = json.loads(request.body)
            content = data.get('content')
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            created_by = user_data['username'] if user_data else 'anonymous'
            
            # Get collections
            discussions_collection = db['discussions']
            comments_collection = db['comments']
            
            # Check if discussion exists
            discussion = discussions_collection.find_one({'_id': ObjectId(pk)})
            
            if not discussion:
                return JsonResponse({'success': False, 'error': {'message':'Discussion not found'}}, status=404)
            
            # Create comment document
            comment_doc = {
                'discussion_id': pk,
                'content': content,
                'created_by': created_by,
                'created_at': int(time.time() * 1000)  # Store as timestamp (ms)
            }
            
            # Insert comment
            result = comments_collection.insert_one(comment_doc)
            
            return JsonResponse({'success': True, 'data': {'id': str(result.inserted_id)}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
