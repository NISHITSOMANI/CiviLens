import random
from datetime import datetime, timedelta
import os
import sys

# Ensure project root (CiviLens_backend) is on sys.path when running directly
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Uses existing Mongo connection helper
from db_connection import db

LEGIT_TITLES = [
    "National Scholarship Portal - Merit Scholarship",
    "PM Kisan Samman Nidhi",
    "State Education Grant for Girls",
    "Skill India Vocational Training Stipend",
    "Minority Scholarship for Higher Education",
    "SC/ST Post Matric Scholarship",
    "Research Fellowship - University Grants Commission",
    "Digital India Internship Programme",
    "Senior Citizen Health Support Scheme",
    "Startup India Seed Fund Assistance",
]

LEGIT_DOMAINS = [
    "https://scholarships.gov.in/",
    "https://www.mygov.in/",
    "https://pib.gov.in/",
    "https://www.nicscholarship.nic.in/",
    "https://rural.nic.in/",
    "https://www.india.gov.in/",
]

LEGIT_DESC_SNIPPETS = [
    "Applicants must be Indian citizens and meet the income criteria.",
    "Apply through the official portal using Aadhaar-based authentication.",
    "No application fee is required. Selection will be based on merit.",
    "Please upload the necessary documents including income and caste certificates.",
    "Refer to the official guidelines for eligibility and timelines.",
]

SCAM_TITLES = [
    "100% Free Government Money Now",
    "Instant Student Grant via WhatsApp",
    "PM Fund Guaranteed Cash Payout",
    "Limited Time: National Scholarship Fee Refund",
    "Telegram Bonus for Women Entrepreneurs",
    "Urgent: Aadhaar Update to Claim ₹50,000 Benefit",
    "One-Click Registration, No Documents Needed",
    "Win Government Laptop Today",
    "Instant Health Card Without Hospital Visit",
    "Registration Fee Needed to Unlock Grant",
]

SCAM_DOMAINS = [
    "http://free-grant-online.xyz/",
    "http://gov-benefits-fast.online/",
    "http://pm-cash-bonus.top/",
    "http://student-refund-now.info/",
    "http://telegram-benefits.shop/",
    "http://aadhaar-update-quick.xyz/",
]

SCAM_DESC_SNIPPETS = [
    "Act now! Limited time offer, pay a small registration fee to claim.",
    "Send your details on WhatsApp to get instant approval.",
    "No documents required, 100% guaranteed payout.",
    "Contact our agent on Telegram for faster processing.",
    "Hurry! Last date today. Immediate credit to your bank account.",
]

CATEGORIES = [
    "Education",
    "Agriculture",
    "Health",
    "Entrepreneurship",
    "Social Welfare",
]


def _make_legit(i: int):
    title = random.choice(LEGIT_TITLES)
    desc = f"{random.choice(LEGIT_DESC_SNIPPETS)} {random.choice(LEGIT_DESC_SNIPPETS)}"
    url = random.choice(LEGIT_DOMAINS)
    cat = random.choice(CATEGORIES)
    return {
        "title": title,
        "description": desc,
        "meta": {"source_url": url, "category": cat},
        "label": "legit",
        "created_at": datetime.utcnow(),
    }


def _make_scam(i: int):
    title = random.choice(SCAM_TITLES)
    desc = f"{random.choice(SCAM_DESC_SNIPPETS)} {random.choice(SCAM_DESC_SNIPPETS)}"
    url = random.choice(SCAM_DOMAINS)
    cat = random.choice(CATEGORIES)
    return {
        "title": title,
        "description": desc,
        "source_url": url,
        "meta": {"source_url": url, "category": cat},
        "label": "scam",
        "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 400)),
    }


def seed(total: int = 80, legit_ratio: float = 0.5):
    """
    Insert synthetic labeled samples into MongoDB training_samples.
    Default: 80 samples (approx 40 legit, 40 scam).
    """
    n_legit = int(total * legit_ratio)
    n_scam = total - n_legit

    docs = []
    for i in range(n_legit):
        docs.append(_make_legit(i))
    for i in range(n_scam):
        docs.append(_make_scam(i))

    random.shuffle(docs)

    coll = db["training_samples"]
    # Avoid duplicates by simple signature on title+label
    existing = set()
    for d in coll.find({}, {"title": 1, "label": 1}):
        existing.add((d.get("title"), d.get("label")))

    to_insert = [d for d in docs if (d["title"], d["label"]) not in existing]
    if not to_insert:
        return {"inserted": 0}

    res = coll.insert_many(to_insert)
    return {"inserted": len(res.inserted_ids)}


if __name__ == "__main__":
    out = seed()
    print(out)
