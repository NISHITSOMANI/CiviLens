from django.views import View
from django.http import JsonResponse
from .models import SentimentRecord

class SentimentOverviewView(View):
    def get(self, request):
        total = SentimentRecord.objects.count()
        return JsonResponse({'success': True, 'data': {'total': total}})
