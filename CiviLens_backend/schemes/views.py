import json
from django.views import View
from django.http import JsonResponse
from .models import Scheme

class SchemeListView(View):
    def get(self, request):
        try:
            q = request.GET.get('q', '')
            region = request.GET.get('region')
            limit = int(request.GET.get('limit', 20))
            offset = int(request.GET.get('offset', 0))
            qs = Scheme.objects.all()
            if q:
                qs = qs.filter(title__icontains=q)
            if region:
                qs = qs.filter(region=region)
            total = qs.count()
            results = list(qs[offset:offset+limit].values())
            return JsonResponse({'success': True, 'results': results, 'total': total, 'limit': limit, 'offset': offset})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class SchemeDetailView(View):
    def get(self, request, pk):
        try:
            scheme = Scheme.objects.get(id=pk)
            data = {
                'id': scheme.id,
                'title': scheme.title,
                'summary': scheme.summary,
                'region': scheme.region,
                'prediction_score': scheme.prediction_score,
            }
            return JsonResponse({'success': True, 'data': data})
        except Scheme.DoesNotExist:
            return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
