# Seed initial schemes into MongoDB
# Usage: python scripts/seed_schemes.py

import os
import sys
from datetime import datetime

# Ensure project root (CiviLens_backend) is on sys.path so we can import db_connection
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from db_connection import db

SAMPLE_SCHEMES = [
    {
        'title': 'Healthcare Assistance Program',
        'description': 'Provides financial assistance for medical treatments to low-income families.',
        'summary': 'Medical cost support for eligible citizens',
        'category': 'Health',
        'region': 'National',
        'eligibility': 'Household income below threshold; valid ID',
        'benefits': 'Up to ₹50,000 per year for approved treatments',
        'deadline': '2025-12-31',
        'status': 'active',
        'applicants': 12345,
        'source_url': 'https://example.gov.in/healthcare-assistance',
    },
    {
        'title': 'Education Scholarship Scheme',
        'description': 'Scholarships for meritorious students pursuing higher education.',
        'summary': 'Merit-based scholarships for UG/PG',
        'category': 'Education',
        'region': 'National',
        'eligibility': 'Minimum 75% in last qualifying exam',
        'benefits': 'Tuition fee waiver and stipend',
        'deadline': '2025-06-30',
        'status': 'active',
        'applicants': 8765,
        'source_url': 'https://example.gov.in/education-scholarship',
    },
    {
        'title': 'Farmer Support Initiative',
        'description': 'Subsidies on seeds and fertilizers for registered farmers.',
        'summary': 'Agriculture input subsidy',
        'category': 'Agriculture',
        'region': 'State',
        'eligibility': 'Registered farmer with valid land records',
        'benefits': '30% subsidy on seeds and fertilizers',
        'deadline': '2025-09-15',
        'status': 'active',
        'applicants': 43210,
        'source_url': 'https://example.gov.in/farmer-support',
    },
]

def main():
    col = db['schemes']
    now = datetime.utcnow().isoformat()
    docs = []
    for s in SAMPLE_SCHEMES:
        s['created_at'] = now
        s['updated_at'] = now
        docs.append(s)
    # avoid duplicates by title
    titles = [d['title'] for d in docs]
    existing = set([d.get('title') for d in col.find({'title': {'$in': titles}}, {'title': 1})])
    to_insert = [d for d in docs if d['title'] not in existing]
    if not to_insert:
        print('Schemes already seeded. Nothing to do.')
        return
    res = col.insert_many(to_insert)
    print(f'Inserted {len(res.inserted_ids)} schemes.')

if __name__ == '__main__':
    main()
