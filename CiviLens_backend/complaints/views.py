import json
from django.views import View
from django.http import JsonResponse
from .models import Complaint

class ComplaintListCreateView(View):
    def get(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            qs = Complaint.objects.filter(user=user)
        else:
            qs = Complaint.objects.none()
        results = list(qs.values())
        return JsonResponse({'success': True, 'results': results})

    def post(self, request):
        try:
            data = json.loads(request.body)
            description = data.get('description')
            region = data.get('region')
            topic = data.get('topic')
            urgency = int(data.get('urgency', 3))
            user = getattr(request, 'user', None)
            c = Complaint.objects.create(user=user if user and user.is_authenticated else None, description=description, region=region, topic=topic, urgency=urgency)
            return JsonResponse({'success': True, 'data': {'id': c.id}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class ComplaintDetailView(View):
    def get(self, request, pk):
        try:
            c = Complaint.objects.get(id=pk)
            return JsonResponse({'success': True, 'data': {'id': c.id, 'description': c.description, 'status': c.status}})
        except Complaint.DoesNotExist:
            return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
