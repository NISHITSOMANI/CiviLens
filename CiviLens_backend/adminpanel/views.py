from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminUsersView(View):
    def get(self, request):
        if not getattr(request, 'user', None) or not getattr(request.user, 'is_staff', False):
            return JsonResponse({'success': False, 'error': {'message':'Admin required'}}, status=403)
        results = list(User.objects.all().values('id','username','email','role','is_active'))
        return JsonResponse({'success': True, 'results': results})
