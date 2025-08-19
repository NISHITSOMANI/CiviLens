import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from bson import ObjectId
from db_connection import db

TOP_STATES = [
    'Maharashtra','Uttar Pradesh','Tamil Nadu','Karnataka','Gujarat','Rajasthan','West Bengal','Telangana'
]

class Command(BaseCommand):
    help = "Inject targeted data to nudge admin analytics: some schemes risky (~50-60) and some likely successful (>65%)."

    def add_arguments(self, parser):
        parser.add_argument('--risky', type=int, default=3, help='Number of schemes to nudge into ~50-60 risk')
        parser.add_argument('--success', type=int, default=3, help='Number of schemes to nudge into >65% success')
        parser.add_argument('--region', action='append', help='Limit tuning to these regions (can repeat). Defaults to top states')
        parser.add_argument('--dry-run', action='store_true', help='Do not write, only print selection')

    def handle(self, *args, **options):
        regions = options.get('region') or TOP_STATES
        risky_n = max(0, int(options.get('risky') or 0))
        success_n = max(0, int(options.get('success') or 0))
        dry = bool(options.get('dry_run'))

        schemes_col = db['schemes']
        complaints = db['complaints']
        sentiments = db['sentiment_records']

        # Pick candidate schemes per region
        candidates = list(schemes_col.find({'region': {'$in': regions}}, {'_id':1,'title':1,'region':1,'updated_at':1}))
        if not candidates:
            self.stdout.write(self.style.WARNING('No schemes found in target regions'))
            return
        random.shuffle(candidates)

        risky_targets = candidates[:risky_n]
        success_targets = candidates[risky_n:risky_n+success_n]

        now = datetime.utcnow()
        ops_summary = {
            'risky': [],
            'success': []
        }

        # 1) Nudge risky: a few OPEN complaints + slight inactivity + some negative sentiments in region
        for sc in risky_targets:
            sid = sc['_id']
            reg = sc.get('region')
            # Add 2 open complaints (kept small to avoid changing heatmap order materially)
            open_cs = []
            for i in range(2):
                when = (now - timedelta(days=random.randint(1, 10))).isoformat()
                open_cs.append({
                    'scheme_id': sid,
                    'region': reg,
                    'state': reg,
                    'location': reg,
                    'severity': 'high' if i % 2 else 'medium',
                    'status': 'open',
                    'created_at': when,
                    'closed_at': None,
                    'description': random.choice([
                        'Long pending approval',
                        'Portal errors during submission',
                        'Did not receive promised benefit yet'
                    ])
                })
            # Add 3 negative sentiments in region (does not affect heatmap)
            neg_sents = []
            for i in range(3):
                when = (now - timedelta(days=random.randint(0, 6))).isoformat()
                neg_sents.append({
                    'region': reg,
                    'label': 'negative',
                    'text': random.choice([
                        'Experience has been frustrating',
                        'Unclear process and delays',
                        'Support response was unhelpful'
                    ]),
                    'created_at': when,
                })
            # Increase inactivity a bit (older updated_at)
            schemes_col.update_one({'_id': sid}, {'$set': {'updated_at': (now - timedelta(days=21)).isoformat()}})

            if not dry:
                if open_cs:
                    complaints.insert_many(open_cs, ordered=False)
                if neg_sents:
                    sentiments.insert_many(neg_sents, ordered=False)

            ops_summary['risky'].append({'scheme_id': str(sid), 'region': reg, 'open_complaints_added': len(open_cs), 'neg_sents_added': len(neg_sents)})

        # 2) Nudge success: many CLOSED complaints and very recent update
        for sc in success_targets:
            sid = sc['_id']
            reg = sc.get('region')
            closed_cs = []
            # Add 6 closed complaints to boost closure rate
            for i in range(6):
                created = now - timedelta(days=random.randint(5, 20))
                closed = created + timedelta(days=random.randint(1, 4))
                closed_cs.append({
                    'scheme_id': sid,
                    'region': reg,
                    'state': reg,
                    'location': reg,
                    'severity': 'low',
                    'status': 'closed',
                    'created_at': created.isoformat(),
                    'closed_at': closed.isoformat(),
                    'description': random.choice([
                        'Issue resolved after follow-up',
                        'Documents verified and approved',
                        'Benefit credited successfully'
                    ])
                })
            # Fresh activity to reduce inactivity penalty
            schemes_col.update_one({'_id': sid}, {'$set': {'updated_at': now.isoformat()}})

            if not dry:
                if closed_cs:
                    complaints.insert_many(closed_cs, ordered=False)

            ops_summary['success'].append({'scheme_id': str(sid), 'region': reg, 'closed_complaints_added': len(closed_cs)})

        self.stdout.write(self.style.SUCCESS(f"Tuning applied. Risky targets: {len(risky_targets)}, Success targets: {len(success_targets)}"))
        self.stdout.write(str(ops_summary))
