from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')
class SchemeListView(View):
    def get(self, request):
        try:
            q = request.GET.get('q', '')
            region = request.GET.get('region')
            limit = int(request.GET.get('limit', 20))
            offset = int(request.GET.get('offset', 0))
            
            # Build query for MongoDB
            query = {}
            if q:
                query['title'] = {'$regex': q, '$options': 'i'}
            if region:
                query['region'] = region
            
            # Get collection
            schemes_collection = db['schemes']
            
            # Count total matching documents
            total = schemes_collection.count_documents(query)
            
            # Get results with limit and offset
            results = list(schemes_collection.find(query, {'_id': 0}).skip(offset).limit(limit))
            
            return JsonResponse({'success': True, 'results': results, 'total': total, 'limit': limit, 'offset': offset})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeDetailView(View):
    def get(self, request, pk):
        try:
            # Get collection
            schemes_collection = db['schemes']
            
            # Find scheme by ID
            scheme = schemes_collection.find_one({'_id': pk})
            if not scheme:
                return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
                
            data = {
                'id': str(scheme['_id']),
                'title': scheme['title'],
                'summary': scheme.get('summary', ''),
                'region': scheme.get('region', ''),
                'prediction_score': scheme.get('prediction_score'),
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
