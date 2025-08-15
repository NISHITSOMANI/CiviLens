from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import time

# Import the database connection from db_connection.py
from db_connection import db

# Example: Store user activity in MongoDB instead of Django models
@csrf_exempt
def log_user_activity(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            activity_type = data.get('activity_type')
            details = data.get('details', {})
            
            # Insert activity into MongoDB
            activity_collection = db['user_activities']
            activity_data = {
                'user_id': user_id,
                'activity_type': activity_type,
                'details': details,
                'timestamp': int(time.time() * 1000)  # Store as timestamp
            }
            result = activity_collection.insert_one(activity_data)
            
            return JsonResponse({
                'success': True,
                'message': 'Activity logged successfully',
                'activity_id': str(result.inserted_id)
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    else:
        return JsonResponse({
            'success': False,
            'error': 'Only POST method allowed'
        })

# Example: Get user analytics from MongoDB
@csrf_exempt
def get_user_analytics(request):
    if request.method == 'GET':
        try:
            # Get analytics data from MongoDB
            analytics_collection = db['user_analytics']
            analytics_data = list(analytics_collection.find({}, {'_id': 0}))
            
            return JsonResponse({
                'success': True,
                'data': analytics_data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    else:
        return JsonResponse({
            'success': False,
            'error': 'Only GET method allowed'
        })
