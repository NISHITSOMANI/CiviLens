from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')

class AdminUsersView(View):
    def get(self, request):
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Check if user is admin
        if not user_data or not user_data.get('is_staff', False):
            return JsonResponse({'success': False, 'error': {'message':'Admin required'}}, status=403)
        
        # Get collection
        users_collection = db['users']
        
        # Get all users with selected fields
        results = list(users_collection.find({}, {'_id': 1, 'username': 1, 'email': 1, 'role': 1, 'is_active': 1}))
        
        # Convert ObjectId to string for JSON serialization
        for user in results:
            user['id'] = str(user['_id'])
            del user['_id']
        
        return JsonResponse({'success': True, 'results': results})
