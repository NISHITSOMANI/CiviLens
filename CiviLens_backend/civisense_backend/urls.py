from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health(request):
    return JsonResponse({'success': True, 'uptime': 'placeholder'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/schemes/', include('schemes.urls')),
    path('api/sentiment/', include('sentiment.urls')),
    path('api/complaints/', include('complaints.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/adminpanel/', include('adminpanel.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/regions/', include('regions.urls')),
    path('api/discussions/', include('discussions.urls')),
    path('health/', health),
]
