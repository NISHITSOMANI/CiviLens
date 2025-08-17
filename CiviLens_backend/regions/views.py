import os
import json
import time
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from db_connection import db


# Canonical list of Indian states/UTs with IDs aligned to frontend
STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
]

def state_id_map():
    return {name: idx+1 for idx, name in enumerate(STATES)}

def id_state_map():
    # Both string and int keys for robustness
    m = {}
    for idx, name in enumerate(STATES, start=1):
        m[idx] = name
        m[str(idx)] = name
    return m

def _safe_lower(x):
    return x.lower().strip() if isinstance(x, str) else ''

def _normalize_region(value: str):
    if not isinstance(value, str):
        return None
    v = value.strip()
    # Numeric ID mapping: try DB lookup first, then static mapping
    if v.isdigit():
        try:
            rid = int(v)
            regions_col = db['regions']
            doc = regions_col.find_one({ '$or': [ { 'id': rid }, { 'code': rid }, { 'state_id': rid }, { '_id': rid } ] }, { 'name': 1 })
            if doc and isinstance(doc.get('name'), str) and doc['name'].strip():
                return doc['name'].strip()
        except Exception:
            pass
        mapped = id_state_map().get(v)
        if mapped:
            return mapped
    # Drop country suffixes
    for suffix in [', India', ',india', ' India']:
        if v.endswith(suffix):
            v = v[: -len(suffix)].strip()
    # Simple normalization for common variants
    aliases = {
        'odisha': 'Odisha', 'orissa': 'Odisha',
        'nct of delhi': 'Delhi', 'delhi': 'Delhi',
        'pondicherry': 'Puducherry'
    }
    key = _safe_lower(v)
    if key in aliases:
        return aliases[key]
    # Title-case match against STATES
    for s in STATES:
        if _safe_lower(s) == key:
            return s
    # Substring match (e.g., 'Ahmedabad, Gujarat' → 'Gujarat')
    for s in STATES:
        if _safe_lower(s) in key:
            return s
    return v

def fetch_population_from_ogd():
    # Placeholder for OGD fetch. If DATA_GOV_IN_API_KEY present, you can implement dataset calls here.
    # For now, return an empty dict; caller will fallback.
    try:
        api_key = os.environ.get('DATA_GOV_IN_API_KEY')
        if not api_key:
            return {}
        # TODO: Implement actual OGD dataset requests and build {state_name: population}
        return {}
    except Exception:
        return {}

FALLBACK_POPULATION = {
    # Rough 2011 Census figures (lakhs converted) as placeholders; update via OGD when key configured
    'Uttar Pradesh': 199812341,
    'Maharashtra': 112374333,
    'Bihar': 104099452,
    'West Bengal': 91276115,
    'Madhya Pradesh': 72626809,
    'Tamil Nadu': 72147030,
    'Rajasthan': 68548437,
    'Karnataka': 61095297,
    'Gujarat': 60439692,
    'Andhra Pradesh': 49577103,
    'Odisha': 41974218,
    'Telangana': 35193978,
    'Kerala': 33406061,
    'Jharkhand': 32988134,
    'Assam': 31205576,
    'Punjab': 27743338,
    'Chhattisgarh': 25545198,
    'Haryana': 25351462,
    'Delhi': 16787941,
    'Jammu and Kashmir': 12548926,
    'Uttarakhand': 10086292,
    'Himachal Pradesh': 6864602,
    'Tripura': 3673917,
    'Meghalaya': 2966889,
    'Manipur': 2855794,
    'Nagaland': 1978502,
    'Goa': 1458545,
    'Arunachal Pradesh': 1383727,
    'Mizoram': 1097206,
    'Sikkim': 610577,
    'Andaman and Nicobar Islands': 380581,
    'Chandigarh': 1055450,
    'Dadra and Nagar Haveli and Daman and Diu': 586956,
    'Ladakh': 274000,
    'Lakshadweep': 64473,
    'Puducherry': 1247953,
}

def fetch_schemes_from_ogd():
    # Placeholder: implement via OGD/MyGov later. For now return empty dict.
    return {}

def aggregate_schemes_by_state():
    """Count schemes per state/UT based on 'region' field in schemes collection.
    Accepts either a state name (e.g., 'Gujarat') or numeric/string ID (e.g., '7').
    Only counts schemes with status not equal to 'inactive' (defaults to active if missing).
    """
    col = db['schemes']
    try:
        rows = list(col.find({}, {'region': 1, 'status': 1}))
    except Exception:
        rows = []
    counts = {}
    for s in rows:
        status = (s.get('status') or 'active').lower()
        if status == 'inactive':
            continue
        reg_val = s.get('region')
        # region could be number, numeric string, or name
        name = None
        if isinstance(reg_val, (int, float)):
            name = _normalize_region(str(int(reg_val)))
        elif isinstance(reg_val, str):
            name = _normalize_region(reg_val)
        if not name:
            continue
        counts[name] = counts.get(name, 0) + 1
    return counts

def aggregate_complaints_by_state():
    complaints_collection = db['complaints']
    # Count active complaints by region/state; treat status not 'closed' as active
    pipeline = [
        { '$project': { 'region': { '$ifNull': ['$region', '$location'] }, 'status': 1 } },
        { '$addFields': { 'regionNorm': { '$toLower': { '$ifNull': ['$region', ''] } } } },
        { '$group': {
            '_id': '$region',
            'total': { '$sum': 1 },
            'active': { '$sum': { '$cond': [ { '$ne': ['$status', 'closed'] }, 1, 0 ] } },
        }}
    ]
    try:
        rows = list(complaints_collection.aggregate(pipeline))
    except Exception:
        rows = []
    out = {}
    for r in rows:
        name = _normalize_region(r.get('_id'))
        if not name:
            continue
        out[name] = {
            'total': r.get('total', 0),
            'active': r.get('active', 0),
        }
    return out

def aggregate_officials_by_state():
    users_collection = db['users']
    # Pull candidate officials and compute counts in Python for robust normalization
    try:
        candidates = list(users_collection.find(
            {
                '$or': [
                    { 'role': { '$exists': True } },
                    { 'is_official': True },
                    { 'is_government': True }
                ]
            },
            {
                'role': 1,
                'is_official': 1,
                'is_government': 1,
                'region': 1,
                'state': 1,
                'location': 1,
                'address.state': 1,
                'profile.state': 1,
            }
        ))
    except Exception:
        candidates = []

    def is_official(doc):
        role = _safe_lower(doc.get('role'))
        if role in ['official','officer','government_official','gov_official','govt official','govt_official','govt officer','government officer']:
            return True
        if doc.get('is_official') or doc.get('is_government'):
            return True
        return False

    counts = {}
    for doc in candidates:
        if not is_official(doc):
            continue
        # Combine possible region fields into a single string for fuzzy matching
        parts = [
            doc.get('region'), doc.get('state'), doc.get('location'),
            (doc.get('address') or {}).get('state') if isinstance(doc.get('address'), dict) else None,
            (doc.get('profile') or {}).get('state') if isinstance(doc.get('profile'), dict) else None,
        ]
        combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
        name = _normalize_region(combined) if combined else None
        if not name:
            continue
        counts[name] = counts.get(name, 0) + 1
    return counts

def compose_region_row(name, pop_map, schemes_map, complaints_map, officials_map):
    sid = state_id_map().get(name)
    complaints = complaints_map.get(name, {})
    active = complaints.get('active', 0)
    total = complaints.get('total', 0)
    officials = officials_map.get(name, 0)
    population = pop_map.get(name) or FALLBACK_POPULATION.get(name) or 0
    schemes = schemes_map.get(name, 0)
    # Simple performance: higher is better when fewer active complaints per 100k and more officials per 100k
    try:
        complaints_per_100k = (active / population) * 100000 if population else active
        officials_per_100k = (officials / population) * 100000 if population else officials
        # Normalize to 0-100 (roughly)
        perf = max(0, min(100, int(85 - complaints_per_100k + 0.5 * officials_per_100k)))
    except Exception:
        perf = 0
    color = 'bg-blue-500'
    return {
        'id': sid or 0,
        'name': name,
        'population': population,
        'complaints': active,
        'schemes': schemes,
        'officials': officials,
        'performance': perf,
        'color': color,
        'totals': { 'complaints': total },
    }


@method_decorator(csrf_exempt, name='dispatch')
class RegionListView(View):
    def get(self, request):
        pop_map = fetch_population_from_ogd()
        # Prefer DB aggregation; OGD can be merged later if needed
        schemes_map = aggregate_schemes_by_state()
        complaints_map = aggregate_complaints_by_state()
        officials_map = aggregate_officials_by_state()

        results = []
        for name in STATES:
            results.append(compose_region_row(name, pop_map, schemes_map, complaints_map, officials_map))
        return JsonResponse({'success': True, 'data': results})


@method_decorator(csrf_exempt, name='dispatch')
class RegionDetailView(View):
    def get(self, request, region_id):
        pop_map = fetch_population_from_ogd()
        schemes_map = aggregate_schemes_by_state()
        complaints_map = aggregate_complaints_by_state()
        officials_map = aggregate_officials_by_state()
        try:
            name = STATES[region_id - 1]
        except Exception:
            return JsonResponse({'success': False, 'error': {'message': 'Region not found'}}, status=404)
        data = compose_region_row(name, pop_map, schemes_map, complaints_map, officials_map)
        return JsonResponse({'success': True, 'data': data})


@method_decorator(csrf_exempt, name='dispatch')
class RegionMetricsView(View):
    def get(self, request, region_id):
        # Provide detailed metrics: resolution rate past 90 days, avg close time, etc., if available
        try:
            name = STATES[region_id - 1]
        except Exception:
            return JsonResponse({'success': False, 'error': {'message': 'Region not found'}}, status=404)

        complaints_collection = db['complaints']
        now_ms = int(time.time() * 1000)
        window_ms = 90 * 24 * 60 * 60 * 1000
        since = now_ms - window_ms
        q_region = { '$or': [ { 'region': name }, { 'location': name } ] }
        try:
            total = complaints_collection.count_documents({ **q_region, 'created_at': { '$gte': since } })
            closed = complaints_collection.count_documents({ **q_region, 'status': 'closed', 'created_at': { '$gte': since } })
        except Exception:
            total = 0
            closed = 0
        resolution_rate = int((closed / total) * 100) if total else 0
        data = {
            'complaint_resolution_rate': resolution_rate,
            'period_days': 90,
        }
        return JsonResponse({'success': True, 'data': data})
