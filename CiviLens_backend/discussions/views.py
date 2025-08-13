import json
from django.views import View
from django.http import JsonResponse
from .models import Discussion, Comment

class DiscussionListCreateView(View):
    def get(self, request):
        results = list(Discussion.objects.all().values())
        return JsonResponse({'success': True, 'results': results})

    def post(self, request):
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            d = Discussion.objects.create(title=title, content=content, created_by=getattr(request, 'user', None).username if getattr(request, 'user', None) and request.user.is_authenticated else 'anonymous')
            return JsonResponse({'success': True, 'data': {'id': d.id}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

class DiscussionDetailView(View):
    def get(self, request, pk):
        try:
            d = Discussion.objects.get(id=pk)
            comments = list(Comment.objects.filter(discussion=d).values())
            data = {'id': d.id, 'title': d.title, 'content': d.content, 'comments': comments}
            return JsonResponse({'success': True, 'data': data})
        except Discussion.DoesNotExist:
            return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)

class CommentCreateView(View):
    def post(self, request, pk):
        try:
            data = json.loads(request.body)
            content = data.get('content')
            d = Discussion.objects.get(id=pk)
            c = Comment.objects.create(discussion=d, content=content, created_by=getattr(request, 'user', None).username if getattr(request, 'user', None) and request.user.is_authenticated else 'anonymous')
            return JsonResponse({'success': True, 'data': {'id': c.id}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
