import os
import uuid
from django.views import View
from django.http import JsonResponse
from django.conf import settings
from .models import Document

class DocumentUploadView(View):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({'success': False, 'error': {'message':'No file uploaded'}}, status=400)
        if file.size > 10 * 1024 * 1024:
            return JsonResponse({'success': False, 'error': {'message':'File too large'}}, status=400)
        ext = os.path.splitext(file.name)[1].lower()
        allowed = ['.pdf','.docx','.jpg','.jpeg','.png']
        if ext not in allowed:
            return JsonResponse({'success': False, 'error': {'message':'Invalid file type'}}, status=400)
        fname = f"{uuid.uuid4().hex}{ext}"
        media_root = settings.MEDIA_ROOT
        os.makedirs(media_root, exist_ok=True)
        path = os.path.join(media_root, fname)
        with open(path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)
        doc = Document.objects.create(owner=request.user if getattr(request, 'user', None) and request.user.is_authenticated else None, file_name=file.name, file_path=path)
        return JsonResponse({'success': True, 'data': {'id': doc.id, 'file_name': doc.file_name}})
