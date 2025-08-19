import os
import csv
import random
import string
from datetime import datetime, timedelta

# Output directory relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SCHEMES_CSV = os.path.join(DATA_DIR, 'schemes.csv')
COMPLAINTS_CSV = os.path.join(DATA_DIR, 'complaints.csv')
SENTIMENTS_CSV = os.path.join(DATA_DIR, 'sentiments.csv')

MONTHS = 18
NOW = datetime.utcnow()
START = NOW - timedelta(days=30*MONTHS)

SEVERITIES = ["low", "medium", "high"]
COMPLAINT_STATUSES = ["open", "in_progress", "closed"]
SENTIMENT_LABELS = ["positive", "neutral", "negative"]

# Minimal region list to avoid importing Django modules
REGIONS = [
    'Maharashtra','Uttar Pradesh','Bihar','West Bengal','Andhra Pradesh','Madhya Pradesh',
    'Tamil Nadu','Rajasthan','Karnataka','Gujarat','Odisha','Kerala','Telangana','Assam',
    'Jharkhand','Punjab','Haryana','Chhattisgarh','Delhi','Jammu and Kashmir','Uttarakhand',
    'Himachal Pradesh','Goa','Tripura','Manipur','Meghalaya','Nagaland','Mizoram',
    'Arunachal Pradesh','Sikkim','Puducherry','Chandigarh','Andaman and Nicobar Islands',
    'Ladakh','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'
]

REGION_PRIORS = {
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

REGION_LIST = [r for r in REGIONS if r in REGION_PRIORS]
REGION_WEIGHTS = [REGION_PRIORS[r] for r in REGION_LIST]
s = sum(REGION_WEIGHTS)
REGION_WEIGHTS = [w/s for w in REGION_WEIGHTS]

def _rand_name(prefix: str) -> str:
    return f"{prefix}-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def _seasonal_multiplier(dt: datetime) -> float:
    m = dt.month
    if m in (6,7,8,9):
        return 1.15
    if m in (11,12):
        return 1.1
    return 1.0

def _complaints_for_scheme(base_rate: float, dt: datetime) -> int:
    lam = base_rate * _seasonal_multiplier(dt)
    draws = 10
    p = min(0.9, lam/draws)
    return sum(1 for _ in range(draws) if random.random() < p)

def ensure_dir(path: str):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def write_csv(path, rows, fieldnames):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def generate(schemes_n: int = 5000):
    ensure_dir(DATA_DIR)

    schemes = []
    for i in range(schemes_n):
        region = random.choices(REGION_LIST, weights=REGION_WEIGHTS, k=1)[0]
        created_at = START + timedelta(days=random.randint(0, 30*MONTHS))
        updated_at = created_at + timedelta(days=random.randint(0, max(1, (NOW - created_at).days)))
        base_rate = random.uniform(0.2, 2.0)
        schemes.append({
            'scheme_id': f'sch_{i}',
            'name': _rand_name('SCH'),
            'region': region,
            'status': random.choice(['active','active','active','paused']),
            'created_at': created_at.isoformat(),
            'updated_at': updated_at.isoformat(),
            'base_rate': round(base_rate, 3),
        })

    complaints = []
    sentiments = []

    for sc in schemes:
        sid = sc['scheme_id']
        region = sc['region']
        created_at = datetime.fromisoformat(sc['created_at'])
        base_rate = float(sc['base_rate'])

        t = max(created_at, START)
        while t < NOW:
            weekly_n = _complaints_for_scheme(base_rate, t)
            for _ in range(weekly_n):
                when = t + timedelta(days=random.randint(0, 6), hours=random.randint(0, 23))
                status = random.choices(COMPLAINT_STATUSES, weights=[0.45, 0.2, 0.35], k=1)[0]
                closed_after = random.randint(3, 45)
                complaints.append({
                    'scheme_id': sid,
                    'region': region,
                    'state': region,
                    'location': region,
                    'severity': random.choices(SEVERITIES, weights=[0.5,0.35,0.15], k=1)[0],
                    'status': status,
                    'created_at': when.isoformat(),
                    'closed_at': (when + timedelta(days=closed_after)).isoformat() if status == 'closed' else '',
                    'description': 'Auto-generated complaint about service/scheme issue.'
                })
                for _s in range(random.randint(0, 3)):
                    sent_when = when + timedelta(days=random.randint(-3, 3))
                    lab = random.choices(
                        SENTIMENT_LABELS,
                        weights=[0.45,0.35,0.20 + min(0.25, weekly_n/20.0)],
                        k=1
                    )[0]
                    sentiments.append({
                        'region': region,
                        'label': lab,
                        'text': 'Generated citizen feedback text',
                        'created_at': sent_when.isoformat(),
                    })
            t += timedelta(days=7)

        if random.random() < 0.1:
            burst_start = NOW - timedelta(days=random.randint(40, 120))
            for _ in range(random.randint(20, 80)):
                when = burst_start + timedelta(days=random.randint(0, 14))
                complaints.append({
                    'scheme_id': sid,
                    'region': region,
                    'state': region,
                    'location': region,
                    'severity': random.choice(SEVERITIES),
                    'status': random.choice(['open','in_progress','closed']),
                    'created_at': when.isoformat(),
                    'closed_at': '',
                    'description': 'Burst complaint wave.'
                })
                sentiments.append({
                    'region': region,
                    'label': random.choice(['negative','negative','neutral','positive']),
                    'text': 'Burst-related negative feedback',
                    'created_at': (when + timedelta(days=random.randint(-2,2))).isoformat(),
                })

    write_csv(SCHEMES_CSV, schemes, fieldnames=list(schemes[0].keys()))
    write_csv(COMPLAINTS_CSV, complaints, fieldnames=list(complaints[0].keys()))
    write_csv(SENTIMENTS_CSV, sentiments, fieldnames=list(sentiments[0].keys()))

    print(f"Wrote {len(schemes)} schemes, {len(complaints)} complaints, {len(sentiments)} sentiments to {DATA_DIR}")


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--schemes', type=int, default=5000)
    ap.add_argument('--out', type=str, default=DATA_DIR)
    args = ap.parse_args()
    if args.out and args.out != DATA_DIR:
        DATA_DIR = args.out
        SCHEMES_CSV = os.path.join(DATA_DIR, 'schemes.csv')
        COMPLAINTS_CSV = os.path.join(DATA_DIR, 'complaints.csv')
        SENTIMENTS_CSV = os.path.join(DATA_DIR, 'sentiments.csv')
    generate(args.schemes)
