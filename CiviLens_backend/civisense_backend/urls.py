from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from core.views import test_mongodb_connection, SampleDataView

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
    path('api/health/', health),
    path('api/test-mongodb/', test_mongodb_connection),
    path('api/sample-data/', SampleDataView.as_view()),
]
