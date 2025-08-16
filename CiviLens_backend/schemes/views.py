from django.views import View
from django.http import JsonResponse
import json
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db
from bson import ObjectId
import re
try:
    from ml.predict import predict_verification as ml_predict, available as ml_available
except Exception:
    ml_predict = None
    ml_available = lambda: False

@method_decorator(csrf_exempt, name='dispatch')
class SchemeListView(View):
    def get(self, request):
        try:
            q = request.GET.get('q', '')
            region = request.GET.get('region')
            category = request.GET.get('category')
            limit = int(request.GET.get('limit', 20))
            offset = int(request.GET.get('offset', 0))
            
            # Build query for MongoDB
            query = {}
            if q:
                query['title'] = {'$regex': q, '$options': 'i'}
            if region:
                query['region'] = region
            if category:
                query['category'] = category
            
            # Get collection
            schemes_collection = db['schemes']
            
            # Count total matching documents
            total = schemes_collection.count_documents(query)
            
            # Get results with limit and offset
            raw = list(schemes_collection.find(query).skip(offset).limit(limit))
            
            # Map to frontend shape
            data = []
            for s in raw:
                data.append({
                    'id': str(s.get('_id')),
                    'title': s.get('title', ''),
                    'description': s.get('description') or s.get('summary', ''),
                    'category': s.get('category') or 'General',
                    'eligibility': s.get('eligibility', ''),
                    'benefits': s.get('benefits', ''),
                    'deadline': s.get('deadline', ''),
                    'applicants': s.get('applicants', 0),
                    'status': s.get('status', 'active'),
                    'verification': s.get('verification', {}),
                })
            
            return JsonResponse({'success': True, 'data': data, 'total': total, 'limit': limit, 'offset': offset})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def post(self, request):
        # Admin-only: create scheme
        try:
            user = getattr(request, 'user_data', None)
            if not user or user.get('role') != 'admin':
                return JsonResponse({'success': False, 'error': {'message': 'Admin only'}}, status=403)
            data = json.loads(request.body or '{}')
            doc = {
                'title': data.get('title', '').strip(),
                'description': data.get('description', '').strip(),
                'summary': data.get('summary', '').strip() if data.get('summary') else '',
                'category': data.get('category', 'General'),
                'region': data.get('region', ''),
                'eligibility': data.get('eligibility', ''),
                'benefits': data.get('benefits', ''),
                'deadline': data.get('deadline', ''),
                'status': data.get('status', 'active'),
                'applicants': data.get('applicants', 0),
                'source_url': data.get('source_url', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
            }
            if not doc['title']:
                return JsonResponse({'success': False, 'error': {'message': 'title is required'}}, status=400)
            schemes_collection = db['schemes']
            res = schemes_collection.insert_one(doc)
            return JsonResponse({'success': True, 'data': {'id': str(res.inserted_id)}}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeDetailView(View):
    def get(self, request, pk):
        try:
            # Get collection
            schemes_collection = db['schemes']
            
            # Find scheme by ID (support ObjectId and string ids)
            scheme = None
            try:
                scheme = schemes_collection.find_one({'_id': ObjectId(pk)})
            except Exception:
                # Fallback to string id
                scheme = schemes_collection.find_one({'_id': pk})
            if not scheme:
                return JsonResponse({'success': False, 'error': {'message':'Not found'}}, status=404)
                
            # Map full detail shape expected by frontend with safe defaults
            data = {
                'id': str(scheme.get('_id')),
                'title': scheme.get('title', ''),
                'description': scheme.get('description') or scheme.get('summary', ''),
                'summary': scheme.get('summary', ''),
                'category': scheme.get('category', 'General'),
                'region': scheme.get('region', ''),
                'eligibility': scheme.get('eligibility', ''),
                'benefits': scheme.get('benefits', ''),
                'deadline': scheme.get('deadline', ''),
                'status': scheme.get('status', 'active'),
                'applicants': scheme.get('applicants', 0),
                'source_url': scheme.get('source_url', ''),
                # Content sections expected by UI
                'overview': scheme.get('overview', scheme.get('description', '')),
                'objectives': scheme.get('objectives') or [],
                'documents': scheme.get('documents') or [],
                'faqs': scheme.get('faqs') or [],
                # Voting fields shown in UI
                'upvotes': scheme.get('upvotes', 0),
                'downvotes': scheme.get('downvotes', 0),
                # Optional ML score
                'prediction_score': scheme.get('prediction_score'),
                # Verification
                'verification': scheme.get('verification') or {},
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def patch(self, request, pk):
        # Admin-only: update scheme
        try:
            user = getattr(request, 'user_data', None)
            if not user or user.get('role') != 'admin':
                return JsonResponse({'success': False, 'error': {'message': 'Admin only'}}, status=403)
            payload = json.loads(request.body or '{}')
            update = {k: v for k, v in payload.items() if k in {
                'title','description','summary','category','region','eligibility','benefits','deadline','status','applicants','source_url'
            }}
            if not update:
                return JsonResponse({'success': False, 'error': {'message': 'No updatable fields provided'}}, status=400)
            update['updated_at'] = datetime.utcnow().isoformat()
            schemes_collection = db['schemes']
            # Try ObjectId then string
            q = None
            try:
                q = {'_id': ObjectId(pk)}
            except Exception:
                q = {'_id': pk}
            res = schemes_collection.update_one(q, {'$set': update})
            if res.matched_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

    def delete(self, request, pk):
        # Admin-only: delete scheme
        try:
            user = getattr(request, 'user_data', None)
            if not user or user.get('role') != 'admin':
                return JsonResponse({'success': False, 'error': {'message': 'Admin only'}}, status=403)
            schemes_collection = db['schemes']
            q = None
            try:
                q = {'_id': ObjectId(pk)}
            except Exception:
                q = {'_id': pk}
            res = schemes_collection.delete_one(q)
            if res.deleted_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeCategoriesView(View):
    def get(self, request):
        try:
            schemes_collection = db['schemes']
            categories = schemes_collection.distinct('category')
            # Filter out None/empty and sort
            categories = sorted([c for c in categories if c])
            return JsonResponse({'success': True, 'data': categories})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeVerifyView(View):
    def post(self, request, pk):
        try:
            # Admin or system may trigger; also allow normal users to request verification
            # We'll not enforce admin for running the scorer
            schemes = db['schemes']
            # Fetch scheme
            try:
                q = {'_id': ObjectId(pk)}
            except Exception:
                q = {'_id': pk}
            scheme = schemes.find_one(q)
            if not scheme:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)

            title = (scheme.get('title') or '').lower()
            description = (scheme.get('description') or scheme.get('summary') or '').lower()
            text = f"{title} {description}"
            source_url = (scheme.get('source_url') or '').lower()

            reasons = []
            score = 0

            # 1) Trusted domains
            trusted_patterns = [r"\.gov\.in$", r"\.nic\.in$", r"gov\.in/", r"mha\.gov\.in", r"mygov\.in", r"pib\.gov\.in"]
            is_trusted = any(re.search(p, source_url) for p in trusted_patterns)
            if is_trusted:
                reasons.append({'type': 'domain', 'weight': -40, 'message': 'Official government domain detected', 'value': source_url})
                score -= 40
            elif source_url:
                # Penalize non-official TLDs slightly
                if re.search(r"(\.info|\.online|\.shop|\.xyz|\.top)$", source_url):
                    reasons.append({'type': 'domain', 'weight': 15, 'message': 'Low-trust TLD', 'value': source_url})
                    score += 15
            else:
                reasons.append({'type': 'metadata', 'weight': 20, 'message': 'Missing source URL', 'value': ''})
                score += 20

            # 2) Urgency / unrealistic benefits cues
            if re.search(r"(act now|limited time|hurry|urgent|last date today)", text):
                reasons.append({'type': 'language', 'weight': 10, 'message': 'Urgency wording', 'value': ''})
                score += 10
            if re.search(r"(100% free|guaranteed|no documents required|instant money|registration fee)", text):
                reasons.append({'type': 'language', 'weight': 15, 'message': 'Unrealistic benefit or fee', 'value': ''})
                score += 15

            # 3) Contact channels red flags
            if re.search(r"(whatsapp|telegram)", text):
                reasons.append({'type': 'contact', 'weight': 10, 'message': 'Messaging app contact mentioned', 'value': ''})
                score += 10
            if re.search(r"(gmail\.com|yahoo\.com|outlook\.com)", text):
                reasons.append({'type': 'contact', 'weight': 10, 'message': 'Personal email domain mentioned', 'value': ''})
                score += 10

            # 4) Completeness checks
            missing = []
            if not scheme.get('eligibility'):
                missing.append('eligibility')
            if not scheme.get('benefits'):
                missing.append('benefits')
            if not scheme.get('deadline'):
                missing.append('deadline')
            if missing:
                reasons.append({'type': 'metadata', 'weight': 10, 'message': f"Missing fields: {', '.join(missing)}", 'value': ''})
                score += 10

            # Try ML prediction (prob of suspicious)
            model_prob = None
            top_terms = []
            model_version = None
            if ml_available() and ml_predict:
                ml_res = ml_predict({
                    'title': scheme.get('title'),
                    'description': scheme.get('description') or scheme.get('summary'),
                    'source_url': scheme.get('source_url')
                })
                model_prob = float(ml_res.get('prob', 0.0))
                top_terms = ml_res.get('top_terms') or []
                model_version = 'ml-tfidf-v1'
                # Blend: 60% ML + 40% rules
                ml_score = int(round(model_prob * 100))
                score = int(round(0.6 * ml_score + 0.4 * score))
                # Add ML explanation as signals
                if top_terms:
                    reasons.append({'type': 'ml_terms', 'weight': 0, 'message': 'Top contributing terms', 'value': top_terms})

            # Clamp score and label after blend
            score = max(0, min(100, score))
            label = 'suspicious' if score >= 50 else 'legit'

            verification = {
                'risk_score': score,
                'label': label,
                'signals': reasons,
                'checked_at': datetime.utcnow().isoformat(),
                'version': 'rules+ml-v1' if model_version else 'rules-v1',
                'model_prob': model_prob,
                'model_version': model_version,
            }
            schemes.update_one(q, {'$set': {'verification': verification, 'updated_at': datetime.utcnow().isoformat()}})

            return JsonResponse({'success': True, 'data': verification})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeVerifyMessageView(View):
    def post(self, request):
        try:
            # Accept raw text and optional source_url; do not persist to DB
            payload = json.loads(request.body or '{}')
            raw_text = (payload.get('text') or '').strip()
            source_url = (payload.get('source_url') or '').lower().strip()
            if not raw_text:
                return JsonResponse({'success': False, 'error': {'message': 'text is required'}}, status=400)

            text = raw_text.lower()

            reasons = []
            score = 0

            # 1) Trusted domains
            trusted_patterns = [r"\.gov\.in$", r"\.nic\.in$", r"gov\.in/", r"mha\.gov\.in", r"mygov\.in", r"pib\.gov\.in"]
            is_trusted = any(re.search(p, source_url) for p in trusted_patterns)
            if is_trusted:
                reasons.append({'type': 'domain', 'weight': -40, 'message': 'Official government domain detected', 'value': source_url})
                score -= 40
            elif source_url:
                if re.search(r"(\.info|\.online|\.shop|\.xyz|\.top)$", source_url):
                    reasons.append({'type': 'domain', 'weight': 15, 'message': 'Low-trust TLD', 'value': source_url})
                    score += 15
            else:
                reasons.append({'type': 'metadata', 'weight': 20, 'message': 'Missing source URL', 'value': ''})
                score += 20

            # 2) Urgency / unrealistic benefits cues
            if re.search(r"(act now|limited time|hurry|urgent|last date today)", text):
                reasons.append({'type': 'language', 'weight': 10, 'message': 'Urgency wording', 'value': ''})
                score += 10
            if re.search(r"(100% free|guaranteed|no documents required|instant money|registration fee)", text):
                reasons.append({'type': 'language', 'weight': 15, 'message': 'Unrealistic benefit or fee', 'value': ''})
                score += 15

            # 3) Contact channels red flags
            if re.search(r"(whatsapp|telegram)", text):
                reasons.append({'type': 'contact', 'weight': 10, 'message': 'Messaging app contact mentioned', 'value': ''})
                score += 10
            if re.search(r"(gmail\.com|yahoo\.com|outlook\.com)", text):
                reasons.append({'type': 'contact', 'weight': 10, 'message': 'Personal email domain mentioned', 'value': ''})
                score += 10

            # 4) Try ML prediction (if available)
            model_prob = None
            top_terms = []
            model_version = None
            if ml_available() and ml_predict:
                ml_res = ml_predict({
                    'title': '',
                    'description': raw_text,
                    'source_url': source_url,
                })
                model_prob = float(ml_res.get('prob', 0.0))
                top_terms = ml_res.get('top_terms') or []
                model_version = 'ml-tfidf-v1'
                ml_score = int(round(model_prob * 100))
                score = int(round(0.6 * ml_score + 0.4 * score))
                if top_terms:
                    reasons.append({'type': 'ml_terms', 'weight': 0, 'message': 'Top contributing terms', 'value': top_terms})

            # Finalize
            score = max(0, min(100, score))
            label = 'suspicious' if score >= 50 else 'legit'

            data = {
                'risk_score': score,
                'label': label,
                'signals': reasons,
                'checked_at': datetime.utcnow().isoformat(),
                'version': 'rules+ml-v1' if model_version else 'rules-v1',
                'model_prob': model_prob,
                'model_version': model_version,
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
@method_decorator(csrf_exempt, name='dispatch')
class SchemeVerifyMarkView(View):
    def post(self, request, pk):
        try:
            user = getattr(request, 'user_data', None)
            # Admin only to override label
            if not user or user.get('role') != 'admin':
                return JsonResponse({'success': False, 'error': {'message': 'Admin only'}}, status=403)
            payload = json.loads(request.body or '{}')
            label = (payload.get('label') or '').lower()
            if label not in ('legit', 'suspicious', 'scam'):
                return JsonResponse({'success': False, 'error': {'message': 'Invalid label'}}, status=400)
            schemes = db['schemes']
            try:
                q = {'_id': ObjectId(pk)}
            except Exception:
                q = {'_id': pk}
            now = datetime.utcnow().isoformat()
            update = {
                'verification.manual_label': label,
                'verification.overridden_by': (user or {}).get('username') or 'admin',
                'verification.overridden_at': now,
                'updated_at': now,
            }
            res = schemes.update_one(q, {'$set': update})
            if res.matched_count == 0:
                return JsonResponse({'success': False, 'error': {'message': 'Not found'}}, status=404)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SchemeImportView(View):
    def post(self, request):
        # Admin-only: bulk import JSON list of schemes
        try:
            user = getattr(request, 'user_data', None)
            if not user or user.get('role') != 'admin':
                return JsonResponse({'success': False, 'error': {'message': 'Admin only'}}, status=403)
            body = json.loads(request.body or '{}')
            items = body if isinstance(body, list) else body.get('items', [])
            if not isinstance(items, list) or not items:
                return JsonResponse({'success': False, 'error': {'message': 'Provide an array of scheme objects'}}, status=400)
            now = datetime.utcnow().isoformat()
            docs = []
            for it in items:
                docs.append({
                    'title': it.get('title', '').strip(),
                    'description': it.get('description', '').strip(),
                    'summary': it.get('summary', '') or '',
                    'category': it.get('category', 'General'),
                    'region': it.get('region', ''),
                    'eligibility': it.get('eligibility', ''),
                    'benefits': it.get('benefits', ''),
                    'deadline': it.get('deadline', ''),
                    'status': it.get('status', 'active'),
                    'applicants': it.get('applicants', 0),
                    'source_url': it.get('source_url', ''),
                    'created_at': now,
                    'updated_at': now,
                })
            # Drop empties
            docs = [d for d in docs if d['title']]
            if not docs:
                return JsonResponse({'success': False, 'error': {'message': 'No valid items'}}, status=400)
            res = db['schemes'].insert_many(docs)
            return JsonResponse({'success': True, 'data': {'inserted': len(res.inserted_ids)}})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
