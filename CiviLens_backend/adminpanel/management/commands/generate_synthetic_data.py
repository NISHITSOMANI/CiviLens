import random
import string
import time
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from db_connection import db
"""
Keep this command self-contained to avoid importing heavy ML frameworks or
non-existent modules during Django management command startup.
"""

# Minimal state list used across the project
STATES = [
    'Maharashtra','Uttar Pradesh','Bihar','West Bengal','Andhra Pradesh','Madhya Pradesh',
    'Tamil Nadu','Rajasthan','Karnataka','Gujarat','Odisha','Kerala','Telangana','Assam',
    'Jharkhand','Punjab','Haryana','Chhattisgarh','Delhi','Jammu and Kashmir','Uttarakhand',
    'Himachal Pradesh','Goa','Tripura','Manipur','Meghalaya','Nagaland','Mizoram',
    'Arunachal Pradesh','Sikkim','Puducherry','Chandigarh','Andaman and Nicobar Islands',
    'Ladakh','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'
]
from pymongo.errors import AutoReconnect, NetworkTimeout

# Realistic synthetic generator for schemes, complaints, and sentiment_records
# - Time span: last 18 months
# - Region-aware scheme placement
# - Seasonality in complaints
# - Closure dynamics and sentiment drift

N_SCHEMES_DEFAULT = 5000
NOW = datetime.utcnow()

SEVERITIES = ["low", "medium", "high"]
COMPLAINT_STATUSES = ["open", "in_progress", "closed"]
SENTIMENT_LABELS = ["positive", "neutral", "negative"]

REGION_PRIORS = {
    # Rough priors to diversify distribution (not exact to population)
    'Maharashtra': 0.09, 'Uttar Pradesh': 0.09, 'Bihar': 0.06, 'West Bengal': 0.06,
    'Andhra Pradesh': 0.05, 'Madhya Pradesh': 0.05, 'Tamil Nadu': 0.06, 'Rajasthan': 0.05,
    'Karnataka': 0.05, 'Gujarat': 0.05, 'Odisha': 0.03, 'Kerala': 0.03, 'Telangana': 0.03,
    'Assam': 0.02, 'Jharkhand': 0.02, 'Punjab': 0.02, 'Haryana': 0.02, 'Chhattisgarh': 0.02,
    'Delhi': 0.02, 'Jammu and Kashmir': 0.01, 'Uttarakhand': 0.01, 'Himachal Pradesh': 0.01,
    'Goa': 0.005, 'Tripura': 0.005, 'Manipur': 0.005, 'Meghalaya': 0.005, 'Nagaland': 0.003,
    'Mizoram': 0.003, 'Arunachal Pradesh': 0.003, 'Sikkim': 0.002, 'Puducherry': 0.002,
    'Chandigarh': 0.002, 'Andaman and Nicobar Islands': 0.001, 'Ladakh': 0.001,
    'Dadra and Nagar Haveli and Daman and Diu': 0.001, 'Lakshadweep': 0.0005
}
REGION_LIST = [s for s in STATES if s in REGION_PRIORS]
REGION_WEIGHTS = [REGION_PRIORS[s] for s in REGION_LIST]
# Normalize weights
s = sum(REGION_WEIGHTS)
REGION_WEIGHTS = [w/s for w in REGION_WEIGHTS]


def _rand_name(prefix: str) -> str:
    return f"{prefix}-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def _seasonal_multiplier(dt: datetime) -> float:
    # Complaints tend to increase slightly in monsoon and year-end
    m = dt.month
    if m in (6,7,8,9):
        return 1.15
    if m in (11,12):
        return 1.1
    return 1.0


def _complaints_for_scheme(base_rate: float, dt: datetime) -> int:
    # Poisson-like draw with seasonality
    lam = base_rate * _seasonal_multiplier(dt)
    # Simple Poisson approximation using sum of Bernoulli
    draws = 10
    p = min(0.9, lam/draws)
    return sum(1 for _ in range(draws) if random.random() < p)


# UI helper blocks so Scheme Detail has content
COMMON_DOCUMENTS = [
    'Aadhaar Card',
    'Address Proof',
    'Bank Passbook / Account Details',
    'Caste/Income Certificate (if applicable)',
    'Passport-size Photograph',
]
COMMON_FAQS = [
    { 'question': 'Who is eligible for this scheme?', 'answer': 'Eligibility is based on income, category, and other criteria as notified by the respective department.' },
    { 'question': 'How to apply?', 'answer': 'Applications can be submitted through the official portal or at designated facilitation centers.' },
    { 'question': 'What is the typical processing time?', 'answer': 'Processing usually takes 2–6 weeks depending on completeness of documents and verification.' },
]


def _chunked_insert(col, docs, batch_size=2000, max_retries=5, **kwargs):
    """Robust chunked insert with exponential backoff on transient network errors."""
    n = len(docs)
    for i in range(0, n, batch_size):
        chunk = docs[i:i+batch_size]
        attempt = 0
        while True:
            try:
                if chunk:
                    col.insert_many(chunk, **kwargs)
                break
            except (AutoReconnect, NetworkTimeout) as e:
                attempt += 1
                if attempt > max_retries:
                    raise
                # Exponential backoff up to 10s
                time.sleep(min(2 ** attempt, 10))


class Command(BaseCommand):
    help = "Generate a large, realistic synthetic dataset for schemes, complaints, and sentiments"

    def add_arguments(self, parser):
        parser.add_argument('--schemes', type=int, default=N_SCHEMES_DEFAULT)
        parser.add_argument('--wipe', action='store_true', help='Wipe existing data in target collections before generating')
        parser.add_argument('--months', type=int, default=18, help='How many months back to simulate (default 18)')
        parser.add_argument('--max-complaints', type=int, default=None, help='Cap total complaints (stop when reached)')
        parser.add_argument('--max-sentiments', type=int, default=None, help='Cap total sentiment records (stop when reached)')

    def handle(self, *args, **options):
        schemes_n = options['schemes']
        wipe = options['wipe']
        months = options['months']
        max_complaints = options.get('max_complaints')
        max_sents = options.get('max_sentiments')

        # Time window for simulation
        start = NOW - timedelta(days=30*months)

        schemes_col = db['schemes']
        complaints_col = db['complaints']
        sentiments_col = db['sentiment_records']

        if wipe:
            # Robust wipe with retries to withstand transient Atlas hiccups
            for col, name in (
                (schemes_col, 'schemes'), (complaints_col, 'complaints'), (sentiments_col, 'sentiment_records')
            ):
                attempt = 0
                while True:
                    try:
                        col.delete_many({})
                        break
                    except (AutoReconnect, NetworkTimeout):
                        attempt += 1
                        if attempt > 5:
                            raise
                        time.sleep(min(2 ** attempt, 10))
            self.stdout.write(self.style.WARNING('Wiped schemes, complaints, sentiment_records collections'))

        self.stdout.write(f"Generating {schemes_n} schemes across {len(REGION_LIST)} regions...")

        # Create schemes
        schemes = []
        for i in range(schemes_n):
            region = random.choices(REGION_LIST, weights=REGION_WEIGHTS, k=1)[0]
            created_at = start + timedelta(days=random.randint(0, 30*months))
            updated_at = created_at + timedelta(days=random.randint(0, max(1, (NOW - created_at).days)))
            base_rate = random.uniform(0.2, 2.0)  # controls complaint volume
            nm = _rand_name('SCH')
            scheme = {
                # Core for analytics
                'name': nm,
                'title': nm,
                'region': region,
                'status': random.choice(['active', 'active', 'active', 'paused']),
                'created_at': created_at.isoformat(),
                'updated_at': updated_at.isoformat(),
                'base_rate': round(base_rate, 3),

                # UI fields for Scheme Detail
                'department': random.choice(['Department of Social Justice','Health & Family Welfare','Rural Development','Urban Development','Education','Agriculture']),
                'category': random.choice(['Health','Education','Social','Housing','Agriculture','Financial Inclusion','Skill']),
                'description': f"{nm} provides support to eligible citizens in {region} with streamlined application and verification processes.",
                'eligibility': 'Indian citizens meeting category-specific criteria as notified by the department.',
                'benefits': 'Beneficiaries receive financial assistance or service benefits as per guidelines.',
                'deadline': (NOW + timedelta(days=random.randint(120, 540))).date().isoformat(),
                'applicants': random.randint(1000, 75000),
                'objectives': [
                    'Improve access to benefits for eligible citizens',
                    'Enable transparent and timely service delivery',
                    'Promote inclusion and awareness',
                ],
                'overview': 'This scheme focuses on improved welfare outcomes through simplified procedures and last-mile delivery.',
                'documents': COMMON_DOCUMENTS,
                'faqs': COMMON_FAQS,
                'upvotes': 0,
                'downvotes': 0,
                'source_url': 'https://www.mygov.in/',
            }
            schemes.append(scheme)
        if schemes:
            _chunked_insert(schemes_col, schemes, batch_size=1000, ordered=False)

        # Reload to get _id values
        scheme_docs = list(schemes_col.find({}, {'_id':1, 'region':1, 'created_at':1, 'updated_at':1, 'base_rate':1}))

        self.stdout.write("Generating complaints with time dynamics and closures...")
        bulk_complaints = []
        bulk_sentiments = []

        total_complaints = 0
        total_sentiments = 0
        for sc in scheme_docs:
            sid = sc['_id']
            region = sc.get('region')
            created_at = datetime.fromisoformat(sc.get('created_at'))
            base_rate = float(sc.get('base_rate') or 0.5)

            # Time iterate by week across lifespan
            t = max(created_at, start)
            while t < NOW:
                # weekly complaints
                weekly_n = _complaints_for_scheme(base_rate, t)
                for _ in range(weekly_n):
                    if max_complaints is not None and total_complaints >= max_complaints:
                        break
                    when = t + timedelta(days=random.randint(0, 6), hours=random.randint(0, 23))
                    status = random.choices(
                        COMPLAINT_STATUSES,
                        weights=[0.45, 0.2, 0.35],
                        k=1
                    )[0]
                    closed_after = random.randint(3, 45)
                    complaint = {
                        'scheme_id': sid,
                        'region': region,
                        'state': region,
                        'location': region,
                        'severity': random.choices(SEVERITIES, weights=[0.5,0.35,0.15], k=1)[0],
                        'status': status,
                        'created_at': when.isoformat(),
                        'closed_at': (when + timedelta(days=closed_after)).isoformat() if status == 'closed' else None,
                        'description': 'Auto-generated complaint about service/scheme issue.'
                    }
                    bulk_complaints.append(complaint)
                    total_complaints += 1

                    # sentiment around the same week (region-level signal)
                    for _s in range(random.randint(0, 3)):
                        if max_sents is not None and total_sentiments >= max_sents:
                            break
                        sent_when = when + timedelta(days=random.randint(-3, 3))
                        # Region sentiment drifts: most regions neutral; negative grows with complaints
                        lab = random.choices(
                            SENTIMENT_LABELS,
                            weights=[0.45, 0.35, 0.20 + min(0.25, weekly_n/20.0)],
                            k=1
                        )[0]
                        bulk_sentiments.append({
                            'region': region,
                            'label': lab,
                            'text': 'Generated citizen feedback text',
                            'created_at': sent_when.isoformat(),
                        })
                        total_sentiments += 1
                t += timedelta(days=7)
                if (max_complaints is not None and total_complaints >= max_complaints) and \
                   (max_sents is None or total_sentiments >= max_sents):
                    break

            # Occasionally add a burst period causing risk labels later
            if random.random() < 0.1 and not (max_complaints is not None and total_complaints >= max_complaints):
                burst_start = NOW - timedelta(days=random.randint(40, 120))
                for _ in range(random.randint(20, 80)):
                    if max_complaints is not None and total_complaints >= max_complaints:
                        break
                    when = burst_start + timedelta(days=random.randint(0, 14))
                    bulk_complaints.append({
                        'scheme_id': sid,
                        'region': region,
                        'state': region,
                        'location': region,
                        'severity': random.choice(SEVERITIES),
                        'status': random.choice(['open','in_progress','closed']),
                        'created_at': when.isoformat(),
                        'closed_at': None,
                        'description': 'Burst complaint wave.'
                    })
                    total_complaints += 1
                    bulk_sentiments.append({
                        'region': region,
                        'label': random.choice(['negative','negative','neutral','positive']),
                        'text': 'Burst-related negative feedback',
                        'created_at': (when + timedelta(days=random.randint(-2,2))).isoformat(),
                    })
                    total_sentiments += 1

            if (max_complaints is not None and total_complaints >= max_complaints) and \
               (max_sents is None or total_sentiments >= max_sents):
                break

        if bulk_complaints:
            _chunked_insert(complaints_col, bulk_complaints, batch_size=2000, ordered=False)
        if bulk_sentiments:
            _chunked_insert(sentiments_col, bulk_sentiments, batch_size=2000, ordered=False)

        self.stdout.write(self.style.SUCCESS(
            f"Created {len(schemes)} schemes, {len(bulk_complaints)} complaints, {len(bulk_sentiments)} sentiment records"
        ))
