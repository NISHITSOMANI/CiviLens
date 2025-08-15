from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')
class SentimentOverviewView(View):
    def get(self, request):
        # Get collection
        sentiment_collection = db['sentiment_records']
        
        # Count total records
        total = sentiment_collection.count_documents({})
        
        return JsonResponse({'success': True, 'data': {'total': total}})
