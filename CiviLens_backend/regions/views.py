from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')
class RegionListView(View):
    def get(self, request):
        # Get collection
        region_insights_collection = db['region_insights']
        
        # Get all region insights
        results = list(region_insights_collection.find({}, {'_id': 0}))
        
        return JsonResponse({'success': True, 'results': results})
