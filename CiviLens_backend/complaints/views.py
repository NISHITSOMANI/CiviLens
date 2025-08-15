import json
import time
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')

class ComplaintListCreateView(View):
    def get(self, request):
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Get collection
        complaints_collection = db['complaints']
        
        # Build query
        query = {}
        if user_data:
            query['user_id'] = str(user_data['_id'])
        else:
            # If no user, return empty results
            return JsonResponse({'success': True, 'results': []})
            
        # Find complaints
        results = list(complaints_collection.find(query, {'_id': 0}))
        return JsonResponse({'success': True, 'results': results})

    def post(self, request):
        try:
            data = json.loads(request.body)
            description = data.get('description')
            region = data.get('region')
            topic = data.get('topic')
            urgency = int(data.get('urgency', 3))
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            
            # Get collection
            complaints_collection = db['complaints']
            
            # Create complaint document
            complaint_doc = {
                'description': description,
                'region': region,
                'topic': topic,
                'urgency': urgency,
                'status': 'open',
                'created_at': int(time.time() * 1000),  # Store as timestamp
                'geo': data.get('geo', {})
            }
            
            # Add user reference if available
            if user_data:
                complaint_doc['user_id'] = str(user_data['_id'])
            
            # Insert complaint
            result = complaints_collection.insert_one(complaint_doc)
            return JsonResponse({'success': True, 'data': {'id': str(result.inserted_id)}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class ComplaintDetailView(View):
    def get(self, request, pk):
        try:
            # Get collection
            complaints_collection = db['complaints']
            
            # Find complaint by ID
            complaint = complaints_collection.find_one({'_id': pk})
            if not complaint:
                return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
                
            return JsonResponse({'success': True, 'data': {'id': str(complaint['_id']), 'description': complaint['description'], 'status': complaint['status']}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
