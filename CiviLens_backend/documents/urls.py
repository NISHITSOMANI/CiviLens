from django.urls import path
from .views import DocumentUploadView, DocumentDetailView

urlpatterns = [
    path('', DocumentUploadView.as_view(), name='document-list-upload'),
    path('<str:doc_id>/', DocumentDetailView.as_view(), name='document-detail'),
    path('<str:doc_id>/download/', DocumentDetailView.as_view(), {'mode': 'download'}, name='document-download'),
]
