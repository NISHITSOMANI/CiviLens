from django.urls import path
from .views import RegionListView, RegionDetailView, RegionMetricsView

urlpatterns = [
    path('', RegionListView.as_view(), name='regions'),
    path('<int:region_id>/', RegionDetailView.as_view(), name='region-detail'),
    path('<int:region_id>/metrics/', RegionMetricsView.as_view(), name='region-metrics'),
]
