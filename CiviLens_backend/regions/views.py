from django.views import View
from django.http import JsonResponse
from .models import RegionInsight

class RegionListView(View):
    def get(self, request):
        results = list(RegionInsight.objects.all().values())
        return JsonResponse({'success': True, 'results': results})
