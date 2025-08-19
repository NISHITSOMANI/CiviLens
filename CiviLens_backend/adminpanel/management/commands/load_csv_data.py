import os
import csv
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from pymongo.errors import AutoReconnect, NetworkTimeout
from db_connection import db

# Simple chunked insert with retries
def _chunked_insert(col, docs, batch_size=2000, max_retries=5, **kwargs):
    n = len(docs)
    for i in range(0, n, batch_size):
        chunk = docs[i:i+batch_size]
        attempt = 0
        while True:
            try:
                if chunk:
                    col.insert_many(chunk, **kwargs)
                break
            except (AutoReconnect, NetworkTimeout):
                attempt += 1
                if attempt > max_retries:
                    raise
                time.sleep(min(2 ** attempt, 10))

class Command(BaseCommand):
    help = "Load CSV data (schemes.csv, complaints.csv, sentiments.csv) into MongoDB collections"

    def add_arguments(self, parser):
        parser.add_argument('--dir', type=str, required=True, help='Directory containing CSV files')
        parser.add_argument('--wipe', action='store_true', help='Wipe collections before loading')

    def handle(self, *args, **options):
        data_dir = options['dir']
        wipe = options['wipe']
        schemes_csv = os.path.join(data_dir, 'schemes.csv')
        complaints_csv = os.path.join(data_dir, 'complaints.csv')
        sentiments_csv = os.path.join(data_dir, 'sentiments.csv')

        if not (os.path.exists(schemes_csv) and os.path.exists(complaints_csv) and os.path.exists(sentiments_csv)):
            raise FileNotFoundError(f"CSV files not found in {data_dir}")

        schemes_col = db['schemes']
        complaints_col = db['complaints']
        sentiments_col = db['sentiment_records']

        if wipe:
            schemes_col.delete_many({})
            complaints_col.delete_many({})
            sentiments_col.delete_many({})
            self.stdout.write(self.style.WARNING('Wiped target collections'))

        # Load schemes
        self.stdout.write('Loading schemes.csv ...')
        schemes = []
        with open(schemes_csv, 'r', encoding='utf-8') as f:
            r = csv.DictReader(f)
            for row in r:
                # match Mongo fields expected elsewhere
                schemes.append({
                    'name': row.get('name'),
                    'region': row.get('region'),
                    'status': row.get('status') or 'active',
                    'created_at': row.get('created_at'),
                    'updated_at': row.get('updated_at') or row.get('created_at'),
                    'base_rate': float(row.get('base_rate') or 0.5),
                })
        if schemes:
            _chunked_insert(schemes_col, schemes, batch_size=1000, ordered=False)

        # Reload to map scheme_id string to inserted _id if needed
        # We will keep complaints referencing by region only; train/infer uses aggregation by scheme_id string in CSV
        # For serving, store scheme_id string too for traceability
        name_region_to_id = {}
        for sc in schemes_col.find({}, {'_id':1, 'name':1, 'region':1}):
            name_region_to_id[(sc.get('name'), sc.get('region'))] = sc['_id']

        # Load complaints
        self.stdout.write('Loading complaints.csv ...')
        complaints = []
        with open(complaints_csv, 'r', encoding='utf-8') as f:
            r = csv.DictReader(f)
            for row in r:
                # Try to link to scheme _id by (name, region) if possible (best-effort)
                # CSV has scheme_id like sch_123; not present in DB, so also store string field for analytics if needed
                complaints.append({
                    'scheme_id': row.get('scheme_id'),  # keep string id
                    'region': row.get('region'),
                    'state': row.get('state') or row.get('region'),
                    'location': row.get('location') or row.get('region'),
                    'severity': row.get('severity') or 'low',
                    'status': row.get('status') or 'open',
                    'created_at': row.get('created_at'),
                    'closed_at': row.get('closed_at') or None,
                    'description': row.get('description') or '',
                })
        if complaints:
            _chunked_insert(complaints_col, complaints, batch_size=2000, ordered=False)

        # Load sentiments
        self.stdout.write('Loading sentiments.csv ...')
        sentiments = []
        with open(sentiments_csv, 'r', encoding='utf-8') as f:
            r = csv.DictReader(f)
            for row in r:
                sentiments.append({
                    'region': row.get('region'),
                    'label': row.get('label'),
                    'text': row.get('text') or '',
                    'created_at': row.get('created_at'),
                })
        if sentiments:
            _chunked_insert(sentiments_col, sentiments, batch_size=2000, ordered=False)

        self.stdout.write(self.style.SUCCESS(
            f"Loaded {len(schemes)} schemes, {len(complaints)} complaints, {len(sentiments)} sentiments from {data_dir}"
        ))
