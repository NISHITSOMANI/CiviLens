from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import re
from db_connection import db
from .nlp_utils import analyze_sentiments, top_tfidf_keywords
from regions.views import _normalize_region, STATES

@method_decorator(csrf_exempt, name='dispatch')
class SentimentOverviewView(View):
    def get(self, request):
        col = db['sentiment_records']
        try:
            # Time window: last 30 days for overview/trends/keywords
            now = datetime.utcnow()
            start_30 = now - timedelta(days=30)
            start_7 = now - timedelta(days=7)

            # Fetch recent records (limit to avoid huge payloads)
            # Accept created_at as ISO string or epoch ms; fallback to now
            rows = list(col.find({}, {'sentiment': 1, 'category': 1, 'text': 1, 'created_at': 1}).limit(5000))

            # If no explicit sentiment records exist, fallback to complaints data
            if not rows:
                complaints_col = db['complaints']
                complaints = list(complaints_col.find({}, {
                    'status': 1,
                    'category': 1,
                    'topic': 1,
                    'description': 1,
                    'created_at': 1,
                }).limit(10000))

                # No keyword lists; sentiment will be determined purely by the NLP model

                synthetic = []
                for c in complaints:
                    text = c.get('description') or ''
                    cat = c.get('category') or c.get('topic') or 'General'
                    status = c.get('status')
                    # Sentiment left unspecified; NLP model will classify below
                    synthetic.append({
                        'sentiment': None,
                        'category': cat,
                        'text': text,
                        'created_at': c.get('created_at'),
                        'status': status,
                    })

                rows = synthetic

            # Attempt DS/NLP-based sentiment on available texts (overrides heuristic if available)
            try:
                texts_all = [(r.get('text') or '') for r in rows]
                nlp_labels = analyze_sentiments(texts_all)
                if nlp_labels:
                    for i, lab in enumerate(nlp_labels):
                        if lab in ('positive', 'neutral', 'negative'):
                            rows[i]['sentiment'] = lab
            except Exception:
                pass

            # No ensemble adjustments; keep pure model outputs

            def parse_dt(v):
                if not v:
                    return now
                try:
                    if isinstance(v, (int, float)):
                        # epoch ms or s
                        ts = float(v)
                        if ts > 1e12:
                            ts /= 1000.0
                        return datetime.utcfromtimestamp(ts)
                except Exception:
                    pass
                try:
                    return datetime.fromisoformat(str(v).replace('Z','').split('+')[0])
                except Exception:
                    return now

            # Overall counts
            counts = Counter()
            total = 0
            # Category -> counts
            cat_pos = Counter()
            cat_tot = Counter()

            # Trends per day for last 7 days
            day_buckets = defaultdict(lambda: {'positive': 0, 'neutral': 0, 'negative': 0})

            # Collect texts within last 30 days for TF-IDF keywords
            texts_30_pairs = []  # list[(text_lower, sentiment)]

            for r in rows:
                s = (r.get('sentiment') or 'neutral').lower()
                if s not in ('positive','neutral','negative'):
                    s = 'neutral'
                counts[s] += 1
                total += 1

                # Category stats
                cat = (r.get('category') or 'General')
                cat_tot[cat] += 1
                if s == 'positive':
                    cat_pos[cat] += 1

                # Time-based
                dt = parse_dt(r.get('created_at'))
                # Trends: last 7 days buckets by date
                if dt >= start_7:
                    key = dt.date().isoformat()
                    day_buckets[key][s] += 1

                # Keywords source: last 30 days texts
                if dt >= start_30:
                    text = (r.get('text') or '')
                    texts_30_pairs.append((text.lower(), s))

            def pct(n, d):
                return int(round((n / d) * 100)) if d else 0

            overall = {
                'positive': pct(counts['positive'], total),
                'neutral': pct(counts['neutral'], total),
                'negative': pct(counts['negative'], total),
            }

            # Build 7 days of trends chronologically
            trends = []
            for i in range(6, -1, -1):
                day = (now - timedelta(days=i)).date().isoformat()
                b = day_buckets.get(day, {'positive':0,'neutral':0,'negative':0})
                dsum = b['positive'] + b['neutral'] + b['negative']
                trends.append({
                    'date': day,
                    'positive': pct(b['positive'], dsum),
                    'neutral': pct(b['neutral'], dsum),
                    'negative': pct(b['negative'], dsum),
                })

            # Categories: top 6 by total, show positive% per category
            categories = []
            for cat, tot in cat_tot.most_common(6):
                categories.append({
                    'name': cat,
                    'positive': pct(cat_pos[cat], tot)
                })

            # Keywords via TF-IDF across last 30 days texts
            keywords = []
            try:
                texts_30 = [t for (t, _s) in texts_30_pairs]
                tfidf_terms = top_tfidf_keywords(texts_30, top_k=12)
                for term, _score in tfidf_terms:
                    # Count docs containing the term and sentiment majority
                    pos = neu = neg = cnt = 0
                    for txt, s in texts_30_pairs:
                        if term in txt:
                            cnt += 1
                            if s == 'positive':
                                pos += 1
                            elif s == 'negative':
                                neg += 1
                            else:
                                neu += 1
                    # choose label
                    if pos >= neg and pos >= neu:
                        label = 'positive'
                    elif neg >= pos and neg >= neu:
                        label = 'negative'
                    else:
                        label = 'neutral'
                    keywords.append({'word': term, 'count': cnt, 'sentiment': label})
            except Exception:
                keywords = []

            data = {
                'overall': overall,
                'trends': trends,
                'categories': categories,
                'keywords': keywords,
            }
            return JsonResponse({'success': True, 'data': data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class SentimentRegionsView(View):
    """Return sentiment score per region/state for heatmap preview.
    Output shape: [ { name: str, sentiment_score: int } ]
    """
    def get(self, request):
        try:
            col = db['sentiment_records']
            # Try to use explicit sentiment records first (recent window)
            now = datetime.utcnow()
            start_30 = now - timedelta(days=30)

            # Pull limited rows for performance
            rows = list(col.find({}, {'text': 1, 'region': 1, 'state': 1, 'location': 1, 'created_at': 1, 'sentiment': 1}).limit(8000))

            # If no sentiment_records, fallback to complaints descriptions as proxy
            if not rows:
                complaints_col = db['complaints']
                rows = list(complaints_col.find({}, {
                    'description': 1,
                    'region': 1,
                    'state': 1,
                    'location': 1,
                    'created_at': 1,
                }).limit(12000))

            # Group texts by normalized region name
            by_region_texts = defaultdict(list)

            def parse_dt(v):
                try:
                    if isinstance(v, (int, float)):
                        ts = float(v)
                        if ts > 1e12:
                            ts /= 1000.0
                        return datetime.utcfromtimestamp(ts)
                    return datetime.fromisoformat(str(v).replace('Z','').split('+')[0])
                except Exception:
                    return now

            for r in rows:
                dt = parse_dt(r.get('created_at'))
                if dt < start_30:
                    continue
                # Prefer explicit region fields and normalize
                parts = [r.get('region'), r.get('state'), r.get('location')]
                combined = ' '.join([p for p in parts if isinstance(p, str) and p.strip()])
                region_name = _normalize_region(combined) if combined else None
                if not region_name:
                    continue
                text = r.get('text') or r.get('description') or ''
                if text:
                    by_region_texts[region_name].append(text)

            # Run model per-region in batches to keep memory lower
            out = []
            for name, texts in by_region_texts.items():
                # Keep only canonical state/UT names
                if name not in STATES:
                    continue
                try:
                    labels = analyze_sentiments(texts)
                except Exception:
                    labels = []
                pos = sum(1 for lab in labels if lab == 'positive')
                neu = sum(1 for lab in labels if lab == 'neutral')
                neg = sum(1 for lab in labels if lab == 'negative')
                total = pos + neu + neg
                score = int(round((pos / total) * 100)) if total else 0
                out.append({ 'name': name, 'sentiment_score': score })

            # Sort by state name for stable UI
            out.sort(key=lambda x: x['name'])
            return JsonResponse({'success': True, 'data': out})
        except Exception as e:
            return JsonResponse({'success': False, 'error': {'message': str(e)}}, status=400)
