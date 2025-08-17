import os
import uuid
import time
from django.views import View
from django.http import JsonResponse
from django.http import FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from db_connection import db
from pymongo import errors as pymongo_errors
from bson import ObjectId

@method_decorator(csrf_exempt, name='dispatch')
class DocumentUploadView(View):
    def get(self, request):
        """List documents, scoped to the authenticated user if available."""
        try:
            user_data = getattr(request, 'user_data', None)
            if not user_data:
                return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)

            documents_collection = db['documents']
            # Always scope by owner_id
            query = {'owner_id': str(user_data['_id'])}

            cursor = documents_collection.find(query).sort('uploaded_at', -1).limit(100)
            docs = []
            for d in cursor:
                # Infer simple type from extension
                name = d.get('file_name', '')
                ext = os.path.splitext(name)[1].lower().lstrip('.')
                if ext in ['jpg', 'jpeg', 'png']:
                    file_type = 'image'
                elif ext in ['pdf']:
                    file_type = 'pdf'
                else:
                    file_type = 'file'

                docs.append({
                    'id': str(d.get('_id')),
                    'name': name,
                    'type': file_type,
                    # Size not stored; attempt fs stat fallback
                    'size': (os.path.getsize(d.get('file_path')) if d.get('file_path') and os.path.exists(d.get('file_path')) else 0),
                    'category': d.get('language', 'en'),
                    'uploadDate': d.get('uploaded_at')
                })

            return JsonResponse({'success': True, 'data': docs})
        except pymongo_errors.PyMongoError:
            return JsonResponse({'success': False, 'error': {'message': 'Database unavailable. Please try again later.'}}, status=503)
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def post(self, request):
        user_data = getattr(request, 'user_data', None)
        if not user_data:
            return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)

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
        
        # Add owner reference (required)
        document_doc['owner_id'] = str(user_data['_id'])
        
        # Insert document record
        try:
            result = documents_collection.insert_one(document_doc)
        except pymongo_errors.PyMongoError:
            return JsonResponse({'success': False, 'error': {'message': 'Database unavailable. Please try again later.'}}, status=503)
        
        return JsonResponse({'success': True, 'data': {'id': str(result.inserted_id), 'file_name': file.name}})


@method_decorator(csrf_exempt, name='dispatch')
class DocumentDetailView(View):
    def _get_owned_doc(self, request, doc_id):
        user_data = getattr(request, 'user_data', None)
        if not user_data:
            return None, JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)
        documents_collection = db['documents']
        try:
            doc = documents_collection.find_one({'_id': ObjectId(doc_id), 'owner_id': str(user_data['_id'])})
            if not doc:
                return None, JsonResponse({'success': False, 'error': {'message': 'Document not found'}}, status=404)
            return doc, None
        except pymongo_errors.PyMongoError:
            return None, JsonResponse({'success': False, 'error': {'message': 'Database unavailable. Please try again later.'}}, status=503)

    def get(self, request, doc_id, mode=None):
        """Stream the file. If mode == 'download', force attachment; else inline view."""
        doc, error_response = self._get_owned_doc(request, doc_id)
        if error_response:
            return error_response
        file_path = doc.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return JsonResponse({'success': False, 'error': {'message': 'File not found on server'}}, status=404)
        try:
            # Infer content type by extension (basic)
            name = doc.get('file_name') or os.path.basename(file_path)
            ext = os.path.splitext(name)[1].lower()
            content_type = 'application/octet-stream'
            viewable_inline = False
            if ext in ['.pdf']:
                content_type = 'application/pdf'
                viewable_inline = True
            elif ext in ['.jpg', '.jpeg']:
                content_type = 'image/jpeg'
                viewable_inline = True
            elif ext in ['.png']:
                content_type = 'image/png'
                viewable_inline = True
            elif ext in ['.docx']:
                content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            response = FileResponse(open(file_path, 'rb'), content_type=content_type)
            # Force attachment for non-viewable types regardless of mode
            disposition = 'attachment' if (mode == 'download' or not viewable_inline) else 'inline'
            response['Content-Disposition'] = f"{disposition}; filename=\"{name}\""
            return response
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def delete(self, request, doc_id):
        try:
            documents_collection = db['documents']
            # Optional: scope deletion to owner if user_data available
            user_data = getattr(request, 'user_data', None)
            query = {'_id': ObjectId(doc_id)}
            if user_data:
                query['owner_id'] = str(user_data['_id'])

            result = documents_collection.delete_one(query)
            if result.deleted_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Document not found'}}, status=404)

            return JsonResponse({'success': True, 'data': {'id': doc_id}})
        except pymongo_errors.PyMongoError:
            return JsonResponse({'success': False, 'error': {'message': 'Database unavailable. Please try again later.'}}, status=503)
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
