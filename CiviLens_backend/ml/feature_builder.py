import re
from typing import Dict, Any

URGENT_PAT = re.compile(r"(act now|limited time|hurry|urgent|last date today)", re.I)
UNREAL_PAT = re.compile(r"(100% free|guaranteed|no documents required|instant money|registration fee)", re.I)
CONTACT_PAT = re.compile(r"(whatsapp|telegram|gmail\.com|yahoo\.com|outlook\.com)", re.I)
TRUSTED_DOMAINS = [r"\.gov\.in$", r"\.nic\.in$", r"gov\.in/", r"mygov\.in", r"pib\.gov\.in"]
LOW_TRUST_TLD = re.compile(r"(\.info|\.online|\.shop|\.xyz|\.top)$", re.I)


def extract_meta_features(text: str, source_url: str) -> Dict[str, Any]:
    text = (text or "")
    url = (source_url or "").lower()
    has_gov = any(re.search(p, url) for p in TRUSTED_DOMAINS)
    low_tld = bool(re.search(LOW_TRUST_TLD, url))
    f = {
        "has_gov_domain": int(has_gov),
        "low_trust_tld": int(low_tld),
        "has_urgency_terms": int(bool(URGENT_PAT.search(text))),
        "has_unreal_terms": int(bool(UNREAL_PAT.search(text))),
        "has_contact_flags": int(bool(CONTACT_PAT.search(text))),
    }
    return f


def prepare_text(sample: Dict[str, Any]) -> str:
    title = sample.get("title") or ""
    desc = sample.get("description") or sample.get("summary") or ""
    return f"{title}\n{desc}".strip()
