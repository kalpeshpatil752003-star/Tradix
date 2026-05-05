import json
import os
import re
import sys

import spacy


DEFAULT_MODEL_PATH = r"C:\Users\kalpe\trade_model3"

MONTHS = {
    "jan": "01",
    "feb": "02",
    "mar": "03",
    "apr": "04",
    "may": "05",
    "jun": "06",
    "jul": "07",
    "aug": "08",
    "sep": "09",
    "oct": "10",
    "nov": "11",
    "dec": "12",
}


def resolve_model_path():
    if len(sys.argv) > 1 and sys.argv[1]:
        return sys.argv[1]
    return os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)


def load_model(model_path=None):
    try:
        return spacy.load(model_path or resolve_model_path())
    except Exception as exc:
        print("Model load failed:", exc, file=sys.stderr)
        return None


def model_health_check():
    nlp = load_model()
    if nlp is None:
        return False

    test_text = "23-Feb BTC/INR BUY 0.5 93600.00 234"
    doc = nlp(test_text)
    return len(doc.ents) > 0


def clean_number(value):
    if value is None:
        return 0
    cleaned = re.sub(r"[^\d.-]", "", str(value).replace(",", ""))
    if cleaned in ("", "-", "."):
        return 0
    try:
        return float(cleaned)
    except ValueError:
        return 0


def normalize_date(value):
    if not value:
        return ""
    raw = str(value).strip()
    iso_match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})$", raw)
    if iso_match:
        return f"{iso_match.group(1)}-{iso_match.group(2).zfill(2)}-{iso_match.group(3).zfill(2)}"

    broker_match = re.match(r"^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{4})$", raw)
    if broker_match:
        month = MONTHS.get(broker_match.group(2)[:3].lower())
        if month:
            return f"{broker_match.group(3)}-{month}-{broker_match.group(1).zfill(2)}"

    return raw


def detect_action(text):
    lowered = text.lower()
    if re.search(r"\b(sell|sold|short|exit)\b", lowered):
        return "sell"
    return "buy"


def candidate_segments(text):
    segments = []
    for line in text.splitlines():
        line = line.strip()
        if line:
            segments.append(line)

    for sentence in re.split(r"(?<=[.!?])\s+|\n+", text):
        sentence = sentence.strip()
        if sentence:
            segments.append(sentence)

    return segments


def trade_from_entities(segment, entities):
    by_label = {}
    for ent in entities:
        by_label.setdefault(ent.label_, []).append(ent.text)

    required = ("SYMBOL", "QUANTITY", "PRICE", "DATE")
    if any(label not in by_label for label in required):
        return None

    return {
        "symbol": by_label["SYMBOL"][0].upper(),
        "action": detect_action(segment),
        "quantity": clean_number(by_label["QUANTITY"][0]),
        "entryPrice": clean_number(by_label["PRICE"][0]),
        "exitPrice": 0,
        "date": normalize_date(by_label["DATE"][0]),
        "fees": clean_number(by_label.get("FEES", [0])[0]),
        "notes": "Extracted by spaCy trade_model3",
    }


def summarize(trades):
    if not trades:
        return "No trades found in this document."
    buys = sum(1 for trade in trades if trade["action"] == "buy")
    sells = sum(1 for trade in trades if trade["action"] == "sell")
    return f"Found {len(trades)} trades with trade_model3. Total buys: {buys}, Total sells: {sells}."


def parse_text(model_path, text):
    nlp = load_model(model_path)
    if nlp is None:
        return {"trades": [], "summary": "No trades found in this document."}

    trades = []
    seen = set()

    for segment in candidate_segments(text):
        doc = nlp(segment)
        trade = trade_from_entities(segment, doc.ents)
        if not trade:
            continue

        key = (
            trade["symbol"],
            trade["action"],
            trade["quantity"],
            trade["entryPrice"],
            trade["date"],
            trade["fees"],
        )
        if key in seen:
            continue
        seen.add(key)
        trades.append(trade)

    return {"trades": trades, "summary": summarize(trades)}


def main():
    model_path = resolve_model_path()
    payload = json.loads(sys.stdin.read() or "{}")
    text = payload.get("text", "")
    print(json.dumps(parse_text(model_path, text)))


if __name__ == "__main__":
    main()
