import os
import uuid
import time
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from db_connection import db

@method_decorator(csrf_exempt, name='dispatch')

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
        
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Get collection
        documents_collection = db['documents']
        
        # Create document record in MongoDB
        document_doc = {
            'file_name': file.name,
            'file_path': path,
            'extracted_text': '',
            'summary': '',
            'language': 'en',
            'uploaded_at': int(time.time() * 1000)  # Store as timestamp
        }
        
        # Add owner reference if available
        if user_data:
            document_doc['owner_id'] = str(user_data['_id'])
        
        # Insert document record
        result = documents_collection.insert_one(document_doc)
        
        return JsonResponse({'success': True, 'data': {'id': str(result.inserted_id), 'file_name': file.name}})
