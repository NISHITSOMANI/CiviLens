import time
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from pymongo.errors import AutoReconnect, NetworkTimeout
from db_connection import db
from collections import defaultdict

# Minimal state list used across the project
STATES = [
    'Maharashtra','Uttar Pradesh','Bihar','West Bengal','Andhra Pradesh','Madhya Pradesh',
    'Tamil Nadu','Rajasthan','Karnataka','Gujarat','Odisha','Kerala','Telangana','Assam',
    'Jharkhand','Punjab','Haryana','Chhattisgarh','Delhi','Jammu and Kashmir','Uttarakhand',
    'Himachal Pradesh','Goa','Tripura','Manipur','Meghalaya','Nagaland','Mizoram',
    'Arunachal Pradesh','Sikkim','Puducherry','Chandigarh','Andaman and Nicobar Islands',
    'Ladakh','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'
]

# Well-known central schemes (accurate names and implementing ministries)
CENTRAL_SCHEMES = [
    {"name": "Pradhan Mantri Jan Dhan Yojana", "department": "Ministry of Finance", "category": "Financial Inclusion"},
    {"name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana", "department": "Ministry of Health and Family Welfare", "category": "Health"},
    {"name": "Pradhan Mantri Awas Yojana - Urban", "department": "Ministry of Housing and Urban Affairs", "category": "Housing"},
    {"name": "Pradhan Mantri Ujjwala Yojana", "department": "Ministry of Petroleum & Natural Gas", "category": "Energy"},
    {"name": "Pradhan Mantri Fasal Bima Yojana", "department": "Ministry of Agriculture & Farmers Welfare", "category": "Agriculture"},
    {"name": "Beti Bachao Beti Padhao", "department": "Ministry of Women & Child Development", "category": "Social"},
    {"name": "Atal Pension Yojana", "department": "Ministry of Finance", "category": "Pension"},
    {"name": "Pradhan Mantri Kaushal Vikas Yojana", "department": "Ministry of Skill Development & Entrepreneurship", "category": "Skill"},
    {"name": "Stand Up India", "department": "Ministry of Finance", "category": "Credit"},
    {"name": "Startup India", "department": "Department for Promotion of Industry and Internal Trade", "category": "Entrepreneurship"},
    {"name": "Digital India", "department": "Ministry of Electronics & IT", "category": "Digital"},
    {"name": "Swachh Bharat Mission - Urban", "department": "Ministry of Housing and Urban Affairs", "category": "Sanitation"},
    {"name": "National Health Mission", "department": "Ministry of Health and Family Welfare", "category": "Health"},
    {"name": "Mid-Day Meal Scheme (PM POSHAN)", "department": "Ministry of Education", "category": "Education"},
    {"name": "National Social Assistance Programme", "department": "Ministry of Rural Development", "category": "Social"},
]

# A few prominent state schemes mapped to specific states
STATE_SCHEMES = [
    {"name": "Kanyashree Prakalpa", "state": "West Bengal", "department": "Department of Women & Child Development", "category": "Education"},
    {"name": "Rythu Bandhu", "state": "Telangana", "department": "Agriculture Department", "category": "Agriculture"},
    {"name": "KALIA", "state": "Odisha", "department": "Agriculture Department", "category": "Agriculture"},
    {"name": "Mahatma Jyotiba Phule Jan Arogya Yojana", "state": "Maharashtra", "department": "Public Health Department", "category": "Health"},
    {"name": "LIFE Mission", "state": "Kerala", "department": "Housing", "category": "Housing"},
    {"name": "Kanyadan Yojana", "state": "Madhya Pradesh", "department": "Women & Child Development", "category": "Social"},
    {"name": "Mukhyamantri Chiranjeevi Swasthya Bima Yojana", "state": "Rajasthan", "department": "Medical & Health", "category": "Health"},
    {"name": "Sarbat Sehat Bima Yojana", "state": "Punjab", "department": "Health & Family Welfare", "category": "Health"},
    {"name": "Mukhyamantri Kanya Sumangala Yojana", "state": "Uttar Pradesh", "department": "Women & Child Development", "category": "Social"},
    {"name": "Ladli Laxmi Yojana", "state": "Madhya Pradesh", "department": "Women & Child Development", "category": "Social"},
    {"name": "YSR Rythu Bharosa", "state": "Andhra Pradesh", "department": "Agriculture Department", "category": "Agriculture"},
    {"name": "Mukhya Mantri Teerth Yatra Yojana", "state": "Delhi", "department": "Tourism", "category": "Social"},
]

# Helper: resilient batch insert
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
    help = "Seed MongoDB with 100+ real schemes (central per-state + selected state schemes) and ~20 diverse complaints"

    def add_arguments(self, parser):
        parser.add_argument('--wipe', action='store_true', help='Wipe target collections before seeding')
        parser.add_argument('--per-region', type=int, default=2, help='Number of complaints per region (approx 2x for pos/neg)')
        parser.add_argument('--days', type=int, default=14, help='Place records within the last D days for dashboards')

    def handle(self, *args, **options):
        wipe = options['wipe']
        schemes_col = db['schemes']
        complaints_col = db['complaints']
        sentiments_col = db['sentiment_records']

        if wipe:
            schemes_col.delete_many({})
            complaints_col.delete_many({})
            sentiments_col.delete_many({})
            self.stdout.write(self.style.WARNING('Wiped schemes, complaints, sentiments collections'))

        now = datetime.utcnow()
        start = now - timedelta(days=365 * 3)

        # Helper content blocks to satisfy UI fields in SchemeDetail.jsx
        common_documents = [
            'Aadhaar Card',
            'Address Proof',
            'Bank Passbook / Account Details',
            'Caste/Income Certificate (if applicable)',
            'Passport-size Photograph'
        ]
        common_faqs = [
            { 'question': 'Who is eligible for this scheme?', 'answer': 'Eligibility is based on income, category, and other criteria as notified by the respective department.' },
            { 'question': 'How to apply?', 'answer': 'Applications can be submitted through the official portal or at designated facilitation centers.' },
            { 'question': 'What is the typical processing time?', 'answer': 'Processing usually takes 2–6 weeks depending on completeness of documents and verification.' }
        ]

        # Central schemes replicated per state (accurate scheme names, applicable pan-India)
        schemes = []
        for st in STATES:
            for cs in CENTRAL_SCHEMES:
                created = start + timedelta(days=15)
                schemes.append({
                    # Core fields
                    'name': cs['name'],
                    'title': cs['name'],  # UI expects 'title'
                    'department': cs['department'],
                    'category': cs['category'],
                    'region': st,
                    'status': 'active',
                    'created_at': created.isoformat(),
                    'updated_at': (created + timedelta(days=180)).isoformat(),
                    'base_rate': 0.6,

                    # UI fields (SchemeDetail.jsx)
                    'description': f"{cs['name']} is implemented by {cs['department']} to advance {cs['category'].lower()} objectives across {st}.",
                    'eligibility': 'Indian citizens meeting category-specific criteria as notified by the ministry/department.',
                    'benefits': 'Eligible beneficiaries receive financial assistance or service benefits as per scheme guidelines.',
                    'deadline': '2025-12-31',
                    'applicants': 50000,
                    'objectives': [
                        'Improve access to benefits for eligible citizens',
                        'Enable transparent and timely service delivery',
                        'Promote inclusion and awareness'
                    ],
                    'overview': 'This scheme provides targeted support with streamlined application and verification processes to ensure timely delivery of benefits.',
                    'documents': common_documents,
                    'faqs': common_faqs,
                    'source_url': 'https://www.mygov.in/',
                    'upvotes': 0,
                    'downvotes': 0,
                })

        # Add selected state-specific schemes
        for ss in STATE_SCHEMES:
            created = start + timedelta(days=90)
            schemes.append({
                'name': ss['name'],
                'title': ss['name'],
                'department': ss['department'],
                'category': ss['category'],
                'region': ss['state'],
                'status': 'active',
                'created_at': created.isoformat(),
                'updated_at': (created + timedelta(days=120)).isoformat(),
                'base_rate': 0.7,
                'description': f"{ss['name']} is a {ss['state']} state scheme administered by {ss['department']}.",
                'eligibility': 'Residents of the state fulfilling the scheme-specific criteria.',
                'benefits': 'Provides direct financial or in-kind support depending on scheme rules.',
                'deadline': '2025-12-31',
                'applicants': 20000,
                'objectives': [
                    'Support targeted beneficiaries in the state',
                    'Enhance outreach in rural and urban regions'
                ],
                'overview': 'The scheme focuses on improving welfare outcomes through simplified procedures and improved last-mile delivery.',
                'documents': common_documents,
                'faqs': common_faqs,
                'source_url': 'https://www.{state}.gov.in/'.format(state=ss['state'].lower().replace(' ','').replace('&','and')),
                'upvotes': 0,
                'downvotes': 0,
            })

        _chunked_insert(schemes_col, schemes, batch_size=2000, ordered=False)
        self.stdout.write(f"Inserted {len(schemes)} scheme entries")

        # Build region -> scheme_ids map to attach complaints to real schemes
        region_to_scheme_ids = defaultdict(list)
        for row in schemes_col.find({}, {'_id':1, 'region':1}):
            reg = row.get('region')
            if isinstance(reg, str):
                region_to_scheme_ids[reg].append(row['_id'])

        # Build mixed complaints across different states and schemes
        # We attach by region and simple text; in analytics we aggregate by region/scheme name where needed
        complaint_samples = [
            ("Service quality improved significantly", "positive"),
            ("Application got rejected without proper reason", "negative"),
            ("Helpline was responsive and helpful", "positive"),
            ("Delay in benefit disbursement", "negative"),
            ("Hospital cashless treatment worked well", "positive"),
            ("Portal downtime during application", "negative"),
            ("Received LPG connection quickly", "positive"),
            ("Housing approval pending for months", "negative"),
            ("Scholarship credited on time", "positive"),
            ("Field office asked for unnecessary documents", "negative"),
        ]

        regions_for_complaints = [
            'Maharashtra','Uttar Pradesh','Tamil Nadu','Karnataka','Gujarat',
            'Rajasthan','West Bengal','Telangana','Odisha','Kerala',
            'Delhi','Madhya Pradesh','Punjab','Assam','Bihar',
        ]

        complaints = []
        sentiments = []
        window_days = max(1, options.get('days') or 14)
        per_region = max(1, options.get('per_region') or 2)
        window_start = now - timedelta(days=window_days)
        for i, region in enumerate(regions_for_complaints):
            for j in range(per_region):
                pos = complaint_samples[(2*(i+j)) % len(complaint_samples)]
                neg = complaint_samples[(2*(i+j)+1) % len(complaint_samples)]
                # Spread within D days window
                when1 = window_start + timedelta(days=((i+j) % window_days))
                when2 = window_start + timedelta(days=((i+j+1) % window_days))
                sid_list = region_to_scheme_ids.get(region) or []
                sid = random.choice(sid_list) if sid_list else None
                complaints.append({
                    'scheme_id': sid,
                    'region': region,
                    'state': region,
                    'location': region,
                    'severity': 'medium',
                    'status': 'closed',
                    'created_at': when1.isoformat(),
                    'closed_at': (when1 + timedelta(days=3)).isoformat(),
                    'description': pos[0],
                })
                sentiments.append({
                    'region': region,
                    'label': pos[1],
                    'text': pos[0],
                    'created_at': (when1 + timedelta(days=1)).isoformat(),
                })
                sid_list = region_to_scheme_ids.get(region) or []
                sid = random.choice(sid_list) if sid_list else None
                complaints.append({
                    'scheme_id': sid,
                    'region': region,
                    'state': region,
                    'location': region,
                    'severity': 'high',
                    'status': 'open',
                    'created_at': when2.isoformat(),
                    'closed_at': None,
                    'description': neg[0],
                })
                sentiments.append({
                    'region': region,
                    'label': neg[1],
                    'text': neg[0],
                    'created_at': (when2 + timedelta(days=1)).isoformat(),
                })

        _chunked_insert(db['complaints'], complaints, ordered=False)
        _chunked_insert(db['sentiment_records'], sentiments, ordered=False)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(schemes)} schemes, {len(complaints)} complaints, {len(sentiments)} sentiments"
        ))
