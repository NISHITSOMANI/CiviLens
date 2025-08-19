from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db
from bson import ObjectId
from collections import defaultdict
from datetime import datetime, timedelta
from regions.views import _normalize_region, STATES
try:
    # Optional ML inference utilities. If unavailable, views fall back to heuristics.
    from ml.infer_schemes import predict_risk_for_schemes, predict_success_for_schemes
except Exception:
    predict_risk_for_schemes = None
    predict_success_for_schemes = None

@method_decorator(csrf_exempt, name='dispatch')

class AdminUsersView(View):
    def get(self, request):
        # Get user data from request (assuming it's set by middleware)
        user_data = getattr(request, 'user_data', None)
        
        # Check if user is admin
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return JsonResponse({'success': False, 'error': {'message':'Admin required'}}, status=403)
        
        # Get collection
        users_collection = db['users']
        
        # Get all users with selected fields
        results = list(users_collection.find({}, {
            '_id': 1,
            'username': 1,
            'email': 1,
            'role': 1,
            'is_active': 1,
            'date_joined': 1,
            'last_login': 1,
            'complaints': 1,
            'schemes': 1,
        }))
        
        # Convert ObjectId to string for JSON serialization
        for user in results:
            user['id'] = str(user.get('_id'))
            if '_id' in user:
                del user['_id']
            # Safe defaults expected by frontend
            user['role'] = user.get('role', 'citizen')
            user['is_active'] = bool(user.get('is_active', True))
            user['date_joined'] = user.get('date_joined') or ''
            user['last_login'] = user.get('last_login') or ''
            user['complaints'] = user.get('complaints', 0)
            user['schemes'] = user.get('schemes', 0)
        
        return JsonResponse({'success': True, 'data': results})


@method_decorator(csrf_exempt, name='dispatch')
class AdminComplaintsListView(View):
    """Admin list complaints with filters.
    Query params: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), region, scheme, status (open|closed)
    """
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        complaints = db['complaints']
        q = {}
        # status
        status = (request.GET.get('status') or '').lower().strip()
        if status in ('open','closed'):
            q['status'] = status
        # date range on created_at (stored as epoch ms or iso)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        if start_date or end_date:
            num_cond = {}
            iso_cond = {}
            try:
                if start_date:
                    dt = datetime.fromisoformat(start_date)
                    num_cond['$gte'] = int(dt.timestamp()*1000)
                    iso_cond['$gte'] = dt.isoformat()
                if end_date:
                    dt2 = datetime.fromisoformat(end_date) + timedelta(days=1)
                    num_cond['$lt'] = int(dt2.timestamp()*1000)
                    iso_cond['$lt'] = dt2.isoformat()
            except Exception:
                pass
            ors = []
            if num_cond:
                ors.append({'created_at': num_cond})
                ors.append({'updated_at': num_cond})
            if iso_cond:
                ors.append({'date': iso_cond})
                ors.append({'created_at': iso_cond})
                ors.append({'updated_at': iso_cond})
            if ors:
                q['$and'] = (q.get('$and') or []) + [{ '$or': ors }]
        # region/state text
        region = request.GET.get('region')
        if region:
            try:
                import re
                q['$or'] = [
                    {'region': {'$regex': re.escape(region), '$options': 'i'}},
                    {'state': {'$regex': re.escape(region), '$options': 'i'}},
                    {'location': {'$regex': re.escape(region), '$options': 'i'}},
                ]
            except Exception:
                q['region'] = region
        # scheme text id/name (best-effort)
        scheme = request.GET.get('scheme')
        if scheme:
            try:
                import re
                q.setdefault('$or', [])
                q['$or'] += [
                    {'scheme': {'$regex': re.escape(scheme), '$options': 'i'}},
                    {'scheme_name': {'$regex': re.escape(scheme), '$options': 'i'}},
                    {'title': {'$regex': re.escape(scheme), '$options': 'i'}},
                ]
            except Exception:
                q['scheme'] = scheme
        # fetch with optional limit and default cap when no filters
        # detect if filters are provided
        has_filters = any([
            bool(status in ('open','closed')),
            bool(start_date),
            bool(end_date),
            bool(region),
            bool(scheme),
        ])
        # parse limit
        limit_param = request.GET.get('limit')
        try:
            limit_val = int(limit_param) if limit_param is not None else None
            if limit_val is not None and limit_val <= 0:
                limit_val = None
        except Exception:
            limit_val = None
        # parse page (1-based)
        page_param = request.GET.get('page')
        try:
            page_val = int(page_param) if page_param is not None else 1
            if page_val <= 0:
                page_val = 1
        except Exception:
            page_val = 1
        # default cap if no filters and no explicit limit
        if not has_filters and limit_val is None:
            limit_val = 10

        try:
            cursor = complaints.find(q)
            # best-effort sort by created_at desc (epoch or iso)
            try:
                cursor = cursor.sort('created_at', -1)
            except Exception:
                pass
            if limit_val is not None:
                # apply skip for pagination
                skip_val = (page_val - 1) * limit_val
                if skip_val > 0:
                    try:
                        cursor = cursor.skip(skip_val)
                    except Exception:
                        pass
                cursor = cursor.limit(limit_val)
            docs = list(cursor)
        except Exception:
            docs = []
        out = []
        for d in docs:
            created = d.get('created_at')
            try:
                if isinstance(created, (int, float)):
                    created_fmt = datetime.utcfromtimestamp(created/1000).isoformat()
                else:
                    created_fmt = str(created)
            except Exception:
                created_fmt = ''
            out.append({
                'id': str(d.get('_id')),
                'title': d.get('title') or d.get('topic') or 'Complaint',
                'scheme': d.get('scheme') or d.get('scheme_name'),
                'region': d.get('region') or d.get('state') or d.get('location'),
                'status': (d.get('status') or 'open').lower(),
                'created_at': created_fmt,
                'assignee': d.get('assignee', ''),
            })
        return JsonResponse({'success': True, 'data': out})


@method_decorator(csrf_exempt, name='dispatch')
class AdminComplaintsHeatmapView(View):
    """Admin heatmap with same filters as list; counts active by region."""
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        complaints = db['complaints']
        q = {}
        # status filter: include all if unspecified
        status = (request.GET.get('status') or '').lower().strip()
        if status in ('open','closed'):
            q['status'] = status
        # date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        if start_date or end_date:
            num_cond = {}
            iso_cond = {}
            try:
                if start_date:
                    dt = datetime.fromisoformat(start_date)
                    num_cond['$gte'] = int(dt.timestamp()*1000)
                    iso_cond['$gte'] = dt.isoformat()
                if end_date:
                    dt2 = datetime.fromisoformat(end_date) + timedelta(days=1)
                    num_cond['$lt'] = int(dt2.timestamp()*1000)
                    iso_cond['$lt'] = dt2.isoformat()
            except Exception:
                pass
            ors = []
            if num_cond:
                ors.append({'created_at': num_cond})
                ors.append({'updated_at': num_cond})
            if iso_cond:
                ors.append({'date': iso_cond})
                ors.append({'updated_at': iso_cond})
            if ors:
                q['$and'] = (q.get('$and') or []) + [{ '$or': ors }]
        # region filter (text contains)
        region = request.GET.get('region')
        if region:
            try:
                import re
                q.setdefault('$or', [])
                q['$or'] += [
                    {'region': {'$regex': re.escape(region), '$options': 'i'}},
                    {'state': {'$regex': re.escape(region), '$options': 'i'}},
                    {'location': {'$regex': re.escape(region), '$options': 'i'}},
                ]
            except Exception:
                q['region'] = region
        # scheme search
        scheme = request.GET.get('scheme')
        if scheme:
            try:
                import re
                q.setdefault('$or', [])
                q['$or'] += [
                    {'scheme': {'$regex': re.escape(scheme), '$options': 'i'}},
                    {'scheme_name': {'$regex': re.escape(scheme), '$options': 'i'}},
                    {'title': {'$regex': re.escape(scheme), '$options': 'i'}},
                ]
            except Exception:
                q['scheme'] = scheme

        try:
            rows = list(complaints.find(q, {'region':1,'state':1,'location':1,'status':1}).limit(20000))
        except Exception:
            rows = []
        counts = defaultdict(int)
        for r in rows:
            parts = [r.get('region'), r.get('state'), r.get('location')]
            combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
            if not combined:
                continue
            norm = _normalize_region(combined)
            # Prefer canonical state name; else use the raw combined string title-cased
            name = norm if (norm in STATES) else combined.strip().title()
            counts[name] += 1
        out = [{ 'name': k, 'complaint_count': v } for k, v in counts.items()]
        out.sort(key=lambda x: x['complaint_count'], reverse=True)
        return JsonResponse({'success': True, 'data': out})

@method_decorator(csrf_exempt, name='dispatch')
class AdminUserDetailView(View):
    def _authorize(self, request):
        user_data = getattr(request, 'user_data', None)
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return None
        return user_data

    def patch(self, request, user_id):
        # Authz
        if not self._authorize(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        # Parse body
        try:
            import json
            payload = json.loads(request.body or '{}')
        except Exception:
            payload = {}
        is_active = bool(payload.get('is_active', True))
        # Update
        users = db['users']
        try:
            oid = ObjectId(user_id)
        except Exception:
            return JsonResponse({'success': False, 'error': {'message': 'Invalid user id'}}, status=400)
        res = users.update_one({'_id': oid}, {'$set': {'is_active': is_active}})
        if res.matched_count == 0:
            return JsonResponse({'success': False, 'error': {'message': 'User not found'}}, status=404)
        doc = users.find_one({'_id': oid}, {'_id': 1, 'username': 1, 'email': 1, 'role': 1, 'is_active': 1})
        data = {
            'id': str(doc['_id']),
            'username': doc.get('username', ''),
            'email': doc.get('email', ''),
            'role': doc.get('role', 'citizen'),
            'is_active': bool(doc.get('is_active', True)),
        }
        return JsonResponse({'success': True, 'data': data})


def _authorize_admin(request):
    user_data = getattr(request, 'user_data', None)
    is_staff = bool(user_data.get('is_staff')) if user_data else False
    role = (user_data or {}).get('role')
    return user_data if (user_data and (is_staff or role == 'admin')) else None


@method_decorator(csrf_exempt, name='dispatch')
class AdminHeatmapView(View):
    """Expose complaints heatmap for admin dashboard (top states by active complaints)."""
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        complaints = db['complaints']
        try:
            rows = list(complaints.find({}, {'region': 1, 'state': 1, 'location': 1, 'status': 1}))
        except Exception:
            rows = []
        counts = defaultdict(int)
        for r in rows:
            if (r.get('status') or '').lower() == 'closed':
                continue
            parts = [r.get('region'), r.get('state'), r.get('location')]
            combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
            name = _normalize_region(combined) if combined else None
            if not name or name not in STATES:
                continue
            counts[name] += 1
        out = [{ 'name': k, 'complaint_count': v } for k, v in counts.items()]
        out.sort(key=lambda x: x['complaint_count'], reverse=True)
        return JsonResponse({'success': True, 'data': out})


@method_decorator(csrf_exempt, name='dispatch')
class AdminSentimentTrendsView(View):
    """Aggregate last 7 days sentiment counts per day across all regions for admin sparkline."""
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        col = db['sentiment_records']
        now = datetime.utcnow()
        start = now - timedelta(days=7)
        try:
            rows = list(col.find({'created_at': { '$gte': start.isoformat() }}, {'label': 1, 'created_at': 1}))
        except Exception:
            rows = []
        # bucket by date (UTC)
        daily = defaultdict(lambda: {'positive': 0, 'neutral': 0, 'negative': 0})
        for r in rows:
            ts = r.get('created_at')
            try:
                # created_at may be iso string or epoch ms
                if isinstance(ts, (int, float)):
                    d = datetime.utcfromtimestamp(ts/1000).date().isoformat()
                else:
                    d = datetime.fromisoformat(str(ts)).date().isoformat()
            except Exception:
                d = now.date().isoformat()
            lab = (r.get('label') or '').lower()
            if lab in ['positive','neutral','negative']:
                daily[d][lab] += 1
        # order by date ascending and compute net score = (pos - neg) / total
        days_sorted = sorted(daily.keys())
        series = []
        for d in days_sorted:
            pos = daily[d]['positive']; neg = daily[d]['negative']; neu = daily[d]['neutral']
            total = pos + neg + neu
            net = ((pos - neg) / total) if total else 0.0
            series.append({'date': d, 'pos': pos, 'neg': neg, 'neu': neu, 'net': round(net, 3)})
        return JsonResponse({'success': True, 'data': series})


def _safe_days_since(ts, now_dt):
    try:
        if isinstance(ts, (int, float)):
            dt = datetime.utcfromtimestamp(ts/1000)
        else:
            dt = datetime.fromisoformat(str(ts))
        return max(0, (now_dt - dt).days)
    except Exception:
        return 999


@method_decorator(csrf_exempt, name='dispatch')
class AdminRiskySchemesView(View):
    """Heuristic risk score per scheme using complaints, sentiment, inactivity."""
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        # Try ML model first
        try:
            if callable(predict_risk_for_schemes):
                preds = predict_risk_for_schemes()
                if preds:
                    data = []
                    for p in preds:
                        data.append({
                            'scheme_id': p.get('scheme_id'),
                            'name': p.get('name') or 'Scheme',
                            'region': p.get('region') or 'Unknown',
                            'risk': int(round(p.get('risk', p.get('risk_prob', 0.0) * 100))),
                            'factors': {}
                        })
                    data.sort(key=lambda x: x['risk'], reverse=True)
                    return JsonResponse({'success': True, 'data': data})
        except Exception:
            # Fall through to heuristic computation
            pass
        schemes = db['schemes']
        complaints = db['complaints']
        sentiments = db['sentiment_records']
        now = datetime.utcnow()
        # fetch schemes
        try:
            scheme_rows = list(schemes.find({}, {'_id':1,'name':1,'region':1,'status':1,'updated_at':1,'created_at':1}))
        except Exception:
            scheme_rows = []
        # pre-aggregate complaints active per region
        c_rows = list(complaints.find({}, {'region':1,'location':1,'state':1,'status':1,'scheme_id':1}))
        complaints_by_region = defaultdict(int)
        complaints_by_scheme = defaultdict(int)
        for c in c_rows:
            if (c.get('status') or 'open').lower() == 'closed':
                continue
            parts = [c.get('region'), c.get('state'), c.get('location')]
            combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
            name = _normalize_region(combined) if combined else None
            if name in STATES:
                complaints_by_region[name] += 1
            sid = str(c.get('scheme_id') or '')
            if sid:
                complaints_by_scheme[sid] += 1
        # rough sentiment map per region (pos ratio)
        try:
            s_rows = list(sentiments.find({}, {'region':1,'text':1,'description':1,'label':1}))
        except Exception:
            s_rows = []
        sent_counts = defaultdict(lambda: {'pos':0,'neu':0,'neg':0})
        for s in s_rows:
            parts = [s.get('region')]
            name = _normalize_region(' '.join([p for p in parts if isinstance(p, str) and p.strip()]))
            if not name or name not in STATES:
                continue
            lab = (s.get('label') or '').lower()
            if lab == 'positive':
                sent_counts[name]['pos'] += 1
            elif lab == 'negative':
                sent_counts[name]['neg'] += 1
            else:
                sent_counts[name]['neu'] += 1
        sent_score = {}
        for k, v in sent_counts.items():
            total = v['pos'] + v['neu'] + v['neg']
            sent_score[k] = (v['pos']/total) if total else 0.5
        # compute risk per scheme
        results = []
        for sc in scheme_rows:
            sid = str(sc.get('_id'))
            region_raw = sc.get('region')
            region = _normalize_region(region_raw) if isinstance(region_raw, str) else None
            region = region if region in STATES else None
            active_c = complaints_by_scheme.get(sid, 0)
            region_c = complaints_by_region.get(region or '', 0)
            ss = sent_score.get(region or '', 0.5)
            inactivity_days = _safe_days_since(sc.get('updated_at') or sc.get('created_at'), now)
            # heuristic: higher complaints, lower sentiment, more inactivity => higher risk
            risk = min(100, int(60* (active_c>0) + 20* (region_c/ max(1, len(c_rows))) + 20* (1-ss) + min(20, inactivity_days/7)))
            results.append({
                'scheme_id': sid,
                'name': sc.get('name') or 'Scheme',
                'region': region or 'Unknown',
                'risk': risk,
                'factors': {
                    'scheme_active_complaints': active_c,
                    'region_active_complaints': region_c,
                    'region_positive_ratio': round(ss,3),
                    'inactivity_days': inactivity_days,
                }
            })
        results.sort(key=lambda x: x['risk'], reverse=True)
        return JsonResponse({'success': True, 'data': results})


@method_decorator(csrf_exempt, name='dispatch')
class AdminSuccessPredictionView(View):
    """Heuristic success probability per scheme; pluggable to ML later."""
    def get(self, request):
        if not _authorize_admin(request):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)
        # Try ML model first
        try:
            if callable(predict_success_for_schemes):
                preds = predict_success_for_schemes()
                if preds:
                    for p in preds:
                        # normalize value name for API
                        if 'success_probability' not in p and 'prob' in p:
                            p['success_probability'] = float(p['prob'])
                    return JsonResponse({'success': True, 'data': preds})
        except Exception:
            # Fall through to heuristic computation
            pass
        schemes = db['schemes']
        complaints = db['complaints']
        now = datetime.utcnow()
        try:
            scheme_rows = list(schemes.find({}, {'_id':1,'name':1,'region':1,'status':1,'updated_at':1,'created_at':1}))
        except Exception:
            scheme_rows = []
        c_rows = list(complaints.find({}, {'scheme_id':1,'status':1,'created_at':1}))
        c_by_scheme = defaultdict(lambda: {'total':0,'closed':0})
        for c in c_rows:
            sid = str(c.get('scheme_id') or '')
            if not sid:
                continue
            c_by_scheme[sid]['total'] += 1
            if (c.get('status') or '').lower() == 'closed':
                c_by_scheme[sid]['closed'] += 1
        results = []
        for sc in scheme_rows:
            sid = str(sc.get('_id'))
            stats = c_by_scheme.get(sid, {'total':0,'closed':0})
            total = stats['total']; closed = stats['closed']
            closure_rate = (closed/total) if total else 0.0
            inactivity_days = _safe_days_since(sc.get('updated_at') or sc.get('created_at'), now)
            # heuristic: success up with closure rate, down with inactivity
            p = max(0.0, min(1.0, 0.6*closure_rate + 0.3*(1 - min(1, inactivity_days/60)) + 0.1))
            results.append({
                'scheme_id': sid,
                'name': sc.get('name') or 'Scheme',
                'success_probability': round(p, 3),
                'factors': {
                    'closure_rate': round(closure_rate,3),
                    'inactivity_days': inactivity_days,
                    'complaints_total': total,
                }
            })
        results.sort(key=lambda x: x['success_probability'], reverse=True)
        return JsonResponse({'success': True, 'data': results})


@method_decorator(csrf_exempt, name='dispatch')
class AdminStatsView(View):
    def get(self, request):
        # Authz
        user_data = getattr(request, 'user_data', None)
        is_staff = bool(user_data.get('is_staff')) if user_data else False
        role = (user_data or {}).get('role')
        if not user_data or not (is_staff or role == 'admin'):
            return JsonResponse({'success': False, 'error': {'message': 'Admin required'}}, status=403)

        users = db['users']
        schemes = db['schemes']
        complaints = db['complaints']

        total_users = users.count_documents({})
        active_users = users.count_documents({'is_active': True})
        admin_users = users.count_documents({'$or': [{'is_staff': True}, {'role': 'admin'}]})
        total_schemes = schemes.count_documents({})
        total_complaints = complaints.count_documents({}) if 'complaints' in db.list_collection_names() else 0

        data = {
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admin_users,
            },
            'schemes': {
                'total': total_schemes,
            },
            'complaints': {
                'total': total_complaints,
            }
        }
        return JsonResponse({'success': True, 'data': data})
