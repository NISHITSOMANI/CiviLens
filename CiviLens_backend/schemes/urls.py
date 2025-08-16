from django.urls import path
from .views import SchemeListView, SchemeDetailView, SchemeCategoriesView, SchemeImportView, SchemeVerifyView, SchemeVerifyMarkView, SchemeVerifyMessageView

urlpatterns = [
    path('', SchemeListView.as_view(), name='scheme-list'),
    path('categories/', SchemeCategoriesView.as_view(), name='scheme-categories'),
    path('import/', SchemeImportView.as_view(), name='scheme-import'),
    path('verify_message/', SchemeVerifyMessageView.as_view(), name='scheme-verify-message'),
    path('<str:pk>/verify/', SchemeVerifyView.as_view(), name='scheme-verify'),
    path('<str:pk>/verify/mark/', SchemeVerifyMarkView.as_view(), name='scheme-verify-mark'),
    path('<str:pk>/', SchemeDetailView.as_view(), name='scheme-detail'),
]
