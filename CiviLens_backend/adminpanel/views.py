from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db
from bson import ObjectId

@method_decorator(csrf_exempt, name='dispatch')

class AdminUsersView(View):
    def get(self, request):
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Check if user is admin
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return JsonResponse({'success': False, 'error': {'message':'Admin required'}}, status=403)
        
        # Get collection
        users_collection = db['users']
        
        # Get all users with selected fields
        results = list(users_collection.find({}, {
            '_id': 1,
            'username': 1,
            'email': 1,
            'role': 1,
            'is_active': 1,
            'date_joined': 1,
            'last_login': 1,
            'complaints': 1,
            'schemes': 1,
        }))
        
        # Convert ObjectId to string for JSON serialization
        for user in results:
            user['id'] = str(user.get('_id'))
            if '_id' in user:
                del user['_id']
            # Safe defaults expected by frontend
            user['role'] = user.get('role', 'citizen')
            user['is_active'] = bool(user.get('is_active', True))
            user['date_joined'] = user.get('date_joined') or ''
            user['last_login'] = user.get('last_login') or ''
            user['complaints'] = user.get('complaints', 0)
            user['schemes'] = user.get('schemes', 0)
        
        return JsonResponse({'success': True, 'data': results})


@method_decorator(csrf_exempt, name='dispatch')
class AdminUserDetailView(View):
    def _authorize(self, request):
        user_data = getattr(request, 'user_data', None)
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return None
        return user_data

    def patch(self, request, user_id):
        # Authz
        if not self._authorize(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        # Parse body
        try:
            import json
            payload = json.loads(request.body or '{}')
        except Exception:
            payload = {}
        is_active = bool(payload.get('is_active', True))
        # Update
        users = db['users']
        try:
            oid = ObjectId(user_id)
        except Exception:
            return JsonResponse({'success': False, 'error': {'message': 'Invalid user id'}}, status=400)
        res = users.update_one({'_id': oid}, {'$set': {'is_active': is_active}})
        if res.matched_count == 0:
            return JsonResponse({'success': False, 'error': {'message': 'User not found'}}, status=404)
        doc = users.find_one({'_id': oid}, {'_id': 1, 'username': 1, 'email': 1, 'role': 1, 'is_active': 1})
        data = {
            'id': str(doc['_id']),
            'username': doc.get('username', ''),
            'email': doc.get('email', ''),
            'role': doc.get('role', 'citizen'),
            'is_active': bool(doc.get('is_active', True)),
        }
        return JsonResponse({'success': True, 'data': data})

    def delete(self, request, user_id):
        if not self._authorize(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        users = db['users']
        try:
            oid = ObjectId(user_id)
        except Exception:
            return JsonResponse({'success': False, 'error': {'message': 'Invalid user id'}}, status=400)
        res = users.delete_one({'_id': oid})
        if res.deleted_count == 0:
            return JsonResponse({'success': False, 'error': {'message': 'User not found'}}, status=404)
        return JsonResponse({'success': True, 'data': {'deleted': True}})


@method_decorator(csrf_exempt, name='dispatch')
class AdminStatsView(View):
    def get(self, request):
        # Authz
        user_data = getattr(request, 'user_data', None)
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)

        users = db['users']
        schemes = db['schemes']
        complaints = db['complaints']

        total_users = users.count_documents({})
        active_users = users.count_documents({'is_active': True})
        admin_users = users.count_documents({'$or': [{'is_staff': True}, {'role': 'admin'}]})
        total_schemes = schemes.count_documents({})
        total_complaints = complaints.count_documents({}) if 'complaints' in db.list_collection_names() else 0

        data = {
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admin_users,
            },
            'schemes': {
                'total': total_schemes,
            },
            'complaints': {
                'total': total_complaints,
            }
        }
        return JsonResponse({'success': True, 'data': data})
