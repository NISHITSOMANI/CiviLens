import json
import time
import os
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db
from django.conf import settings
from collections import defaultdict
from regions.views import _normalize_region, STATES

@method_decorator(csrf_exempt, name='dispatch')

class ComplaintListCreateView(View):
    def get(self, request):
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Get collection
        complaints_collection = db['complaints']
        
        # Build query (if no user, return empty list but keep response shape)
        query = {}
        if user_data:
            query['user_id'] = str(user_data['_id'])
        
        # Fetch complaints
        raw_results = list(complaints_collection.find(query))
        
        # Helper to normalize date to readable string
        def normalize_date(doc):
            d = doc.get('date') or doc.get('created_at')
            try:
                # If it's a numeric epoch ms, format to ISO-like string
                if isinstance(d, (int, float)):
                    return time.strftime('%Y-%m-%d %H:%M', time.localtime(d / 1000))
                return d
            except Exception:
                return d

        # Map DB docs to frontend expected shape
        mapped = []
        for doc in raw_results:
            mapped.append({
                'id': str(doc.get('_id')),
                'title': doc.get('title') or (doc.get('topic') or 'Complaint'),
                'description': doc.get('description', ''),
                'category': doc.get('category') or doc.get('topic') or 'general',
                'location': doc.get('location') or doc.get('region') or 'Unknown',
                'date': normalize_date(doc),
                'upvotes': doc.get('upvotes', 0),
                'status': doc.get('status', 'pending'),
            })
        
        # Sort by upvotes descending by default
        mapped.sort(key=lambda x: x.get('upvotes', 0), reverse=True)

        return JsonResponse({'success': True, 'data': mapped})

    def post(self, request):
        try:
            # Support JSON and multipart forms
            content_type = request.META.get('CONTENT_TYPE', '')
            if content_type.startswith('multipart/form-data'):
                # From <form enctype="multipart/form-data">
                data = request.POST
                description = data.get('description')
                region = data.get('region') or data.get('location')
                topic = data.get('topic') or data.get('category')
                title = data.get('title')
                category = data.get('category')
                location = data.get('location')
                urgency = int(data.get('urgency', 3))
                uploaded_file = request.FILES.get('document')
            else:
                data = json.loads(request.body)
                description = data.get('description')
                region = data.get('region') or data.get('location')
                topic = data.get('topic') or data.get('category')
                title = data.get('title')
                category = data.get('category')
                location = data.get('location')
                urgency = int(data.get('urgency', 3))
                uploaded_file = None
            
            # Get user data from request (assuming it's set by middleware)
            user_data = getattr(request, 'user_data', None)
            # Enforce authentication: only logged-in users can create complaints
            if not user_data:
                return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)
            
            # Get collection
            complaints_collection = db['complaints']
            
            # Create complaint document
            complaint_doc = {
                'description': description,
                'region': region,
                'topic': topic,
                'urgency': urgency,
                'status': 'open',
                'created_at': int(time.time() * 1000),  # Store as timestamp
                'geo': data.get('geo', {}),
                'upvotes': 0,
                'upvoters': [],  # list of user_id strings who upvoted
            }
            # Map additional frontend fields
            if title:
                complaint_doc['title'] = title
            if category:
                complaint_doc['category'] = category
            if location:
                complaint_doc['location'] = location

            # Handle document upload if provided
            if uploaded_file:
                rel_dir = 'complaints'
                os.makedirs(os.path.join(settings.MEDIA_ROOT, rel_dir), exist_ok=True)
                safe_name = f"{int(time.time()*1000)}_{uploaded_file.name}"
                abs_path = os.path.join(settings.MEDIA_ROOT, rel_dir, safe_name)
                with open(abs_path, 'wb') as dest:
                    for chunk in uploaded_file.chunks():
                        dest.write(chunk)
                # Build public URL
                url_path = f"{rel_dir}/{safe_name}"
                relative_url = settings.MEDIA_URL.rstrip('/') + '/' + url_path.replace('\\', '/')
                # Return absolute URL so SPA on different origin can open it directly
                document_url = request.build_absolute_uri(relative_url)
                complaint_doc['document_url'] = document_url
            
            # Add user reference if available
            complaint_doc['user_id'] = str(user_data['_id'])
            
            # Insert complaint
            result = complaints_collection.insert_one(complaint_doc)
            return JsonResponse({'success': True, 'data': {'id': str(result.inserted_id)}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ComplaintHeatmapView(View):
    """Return complaint counts per region for heatmap preview.
    Output shape: [ { name: str, complaint_count: int } ]
    """
    def get(self, request):
        try:
            complaints_collection = db['complaints']
            rows = list(complaints_collection.find({}, {
                'region': 1,
                'location': 1,
                'state': 1,
                'status': 1,
            }).limit(20000))

            counts = defaultdict(int)
            for r in rows:
                # Treat 'closed' as resolved; count only active/open
                status = (r.get('status') or '').lower()
                if status == 'closed':
                    continue
                parts = [r.get('region'), r.get('state'), r.get('location')]
                combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
                name = _normalize_region(combined) if combined else None
                if not name:
                    continue
                # Only include canonical state/UT names
                if name not in STATES:
                    continue
                counts[name] += 1

            out = [ { 'name': k, 'complaint_count': v } for k, v in counts.items() ]
            # Sort by name for stability (frontend can re-order)
            out.sort(key=lambda x: x['name'])
            return JsonResponse({'success': True, 'data': out})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ComplaintDetailView(View):
    def get(self, request, pk):
        try:
            from bson import ObjectId
            # Get collection
            complaints_collection = db['complaints']
            
            # Find complaint by ID (convert to ObjectId if possible)
            oid = None
            try:
                oid = ObjectId(pk)
            except Exception:
                pass
            query = {'_id': oid} if oid else {'_id': pk}
            complaint = complaints_collection.find_one(query)
            if not complaint:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
            
            # Compute already_upvoted for current user
            user_data = getattr(request, 'user_data', None)
            user_id = str(user_data['_id']) if user_data else None
            upvoters = complaint.get('upvoters', [])
            already_upvoted = bool(user_id and user_id in upvoters)

            # Helper to normalize date
            def normalize_date_detail(doc):
                d = doc.get('date') or doc.get('created_at')
                try:
                    if isinstance(d, (int, float)):
                        return time.strftime('%Y-%m-%d %H:%M', time.localtime(d / 1000))
                    return d
                except Exception:
                    return d

            # Normalize stored document_url to absolute (older docs might have relative)
            doc_url = complaint.get('document_url')
            if isinstance(doc_url, str) and doc_url.startswith('/'):
                try:
                    doc_url = request.build_absolute_uri(doc_url)
                except Exception:
                    pass

            data = {
                'id': str(complaint.get('_id')),
                'title': complaint.get('title') or complaint.get('topic') or 'Complaint',
                'description': complaint.get('description', ''),
                'category': complaint.get('category') or complaint.get('topic') or 'general',
                'location': complaint.get('location') or complaint.get('region') or 'Unknown',
                'date': normalize_date_detail(complaint),
                'upvotes': complaint.get('upvotes', 0),
                'status': complaint.get('status', 'pending'),
                'already_upvoted': already_upvoted,
                'document_url': doc_url,
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def patch(self, request, pk):
        try:
            # Admin/staff only
            user_data = getattr(request, 'user_data', None)
            is_staff = bool(user_data.get('is_staff')) if user_data else False
            role = (user_data or {}).get('role')
            if not user_data or not (is_staff or role == 'admin'):
                return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)

            from bson import ObjectId
            import json as _json
            payload = {}
            try:
                payload = _json.loads(request.body or '{}')
            except Exception:
                payload = {}

            updates = {}
            if 'status' in payload:
                val = str(payload.get('status') or '').lower()
                if val in ('open','closed'):
                    updates['status'] = val
            if 'assignee' in payload:
                updates['assignee'] = str(payload.get('assignee') or '')
            if not updates:
                return JsonResponse({'success': False, 'error': {'message': 'No valid fields to update'}}, status=400)

            complaints = db['complaints']
            # id query support both ObjectId and string id
            try:
                oid = ObjectId(pk)
                id_query = {'_id': oid}
            except Exception:
                id_query = {'_id': pk}

            res = complaints.update_one(id_query, {'$set': updates})
            if res.matched_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
            doc = complaints.find_one(id_query)
            data = {
                'id': str(doc.get('_id')),
                'status': doc.get('status', 'open'),
                'assignee': doc.get('assignee', ''),
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ComplaintUpvoteView(View):
    def post(self, request, pk):
        try:
            from bson import ObjectId
            complaints_collection = db['complaints']

            # Require auth
            user_data = getattr(request, 'user_data', None)
            if not user_data:
                return JsonResponse({'success': False, 'error': {'message': 'Authentication required'}}, status=401)
            user_id = str(user_data['_id'])

            # Build id query
            oid = None
            try:
                oid = ObjectId(pk)
            except Exception:
                pass
            id_query = {'_id': oid} if oid else {'_id': pk}

            # Use atomic update to add to upvoters if not present and increment upvotes
            update_result = complaints_collection.update_one(
                {
                    **id_query,
                    'upvoters': { '$ne': user_id },
                },
                {
                    '$addToSet': { 'upvoters': user_id },
                    '$inc': { 'upvotes': 1 },
                }
            )

            if update_result.modified_count == 0:
                # Either not found or already upvoted
                existing = complaints_collection.find_one(id_query)
                if not existing:
                    return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
                return JsonResponse({'success': True, 'data': {
                    'upvotes': existing.get('upvotes', 0),
                    'already_upvoted': True,
                }})

            # Fetch updated doc
            updated = complaints_collection.find_one(id_query)
            return JsonResponse({'success': True, 'data': {
                'upvotes': updated.get('upvotes', 0),
                'already_upvoted': True,
            }})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
