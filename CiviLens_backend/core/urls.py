from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoint
    path('health/', views.health_check, name='health_check'),
    
    # Test endpoints
    path('test-mongodb/', views.test_mongodb_connection, name='test_mongodb_connection'),
    path('sample/', views.SampleDataView.as_view(), name='sample_data'),
]
