"""Small, inspectable algorithms for combining already-observed checker decisions.

This module does not query a bibliographic service or infer bibliographic truth.
Predictors receive only five binary checker flags. Ground truth is used solely for
evaluation and for threshold selection on explicitly separated training documents.
"""
import csv
import math
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

TOOLS = ("checkifexist", "hallucitechecker", "hallucinator", "halref", "refchecker")


@dataclass(frozen=True)
class Record:
    uid: str
    document: str
    reference: str
    label: int
    flags: tuple


def normalized_reference(text):
    """Conservative duplicate screen, not bibliographic entity resolution."""
    return re.sub(r"\W+", "", unicodedata.normalize("NFKC", text).casefold())


def decode_flag(value):
    mapping = {"flagged": 1, "not_flagged": 0}
    value = str(value).strip().casefold()
    if value not in mapping:
        raise ValueError(f"Missing or invalid checker output: {value!r}")
    return mapping[value]


def load_records(path, encoding=None):
    records, seen = [], set()
    # v1 uses legacy CP850; v1.1 has a UTF-8 byte-order mark. Preserve raw bytes.
    if encoding is None:
        encoding = "utf-8-sig" if Path(path).read_bytes().startswith(b"\xef\xbb\xbf") else "cp850"
    with Path(path).open(newline="", encoding=encoding) as handle:
        reader = csv.DictReader(handle)
        required = {"document_id", "reference_number", "reference", "manual_label", *TOOLS}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f"Missing columns: {required - set(reader.fieldnames or [])}")
        for row in reader:
            document = row["document_id"].strip()
            number = row["reference_number"].strip()
            uid = document + ":" + number
            if not document or not number or uid in seen:
                raise ValueError("Empty document or duplicate reference ID: " + uid)
            seen.add(uid)
            label = row["manual_label"].strip().casefold()
            if label not in {"verified", "problematic"}:
                raise ValueError("Unknown ground-truth label: " + label)
            reference = row["reference"].strip()
            if not reference:
                raise ValueError("Empty reference: " + uid)
            records.append(Record(uid, document, reference, int(label == "problematic"),
                                  tuple(decode_flag(row[t]) for t in TOOLS)))
    if not records:
        raise ValueError("Empty dataset")
    return records


def vote(flags, threshold=3):
    flags = tuple(flags)
    if not flags or any(type(x) is not int or x not in (0, 1) for x in flags):
        raise ValueError("Flags must be non-empty binary integers")
    if type(threshold) is not int or not 1 <= threshold <= len(flags):
        raise ValueError("Threshold must be within the panel size")
    return int(sum(flags) >= threshold)


def triage(flags):
    # Validation is shared with the ordinary classifier.
    vote(flags, 3)
    if len(flags) != 5:
        raise ValueError("The prespecified triage rule requires five flags")
    count = sum(flags)
    return "auto_accept" if count <= 1 else "auto_flag" if count >= 4 else "review"


def metrics(y, predictions):
    y, predictions = list(y), list(predictions)
    if len(y) != len(predictions) or not y:
        raise ValueError("Labels and predictions must be aligned and nonempty")
    if any(x not in (0, 1) for x in y + predictions):
        raise ValueError("Metrics require binary labels")
    tp = sum(a == b == 1 for a, b in zip(y, predictions))
    tn = sum(a == b == 0 for a, b in zip(y, predictions))
    fp = sum(a == 0 and b == 1 for a, b in zip(y, predictions))
    fn = sum(a == 1 and b == 0 for a, b in zip(y, predictions))
    recall = tp / (tp + fn) if tp + fn else None
    specificity = tn / (tn + fp) if tn + fp else None
    precision = tp / (tp + fp) if tp + fp else 0.0
    den = (tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)
    return dict(n=len(y), positives=tp + fn, negatives=tn + fp, tp=tp, fp=fp, tn=tn, fn=fn,
                flags=tp + fp, precision=precision, recall=recall,
                specificity=specificity, false_positive_rate=1 - specificity if specificity is not None else None,
                f1=2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else 0.0,
                mcc=(tp * tn - fp * fn) / math.sqrt(den) if den else 0.0,
                accuracy=(tp + tn) / len(y),
                balanced_accuracy=(recall + specificity) / 2 if recall is not None and specificity is not None else None)


def select_threshold(train):
    """Macro-average source-document balanced accuracy; ties choose smaller k."""
    documents = sorted({r.document for r in train})
    scores = []
    for k in range(1, 6):
        values = []
        for document in documents:
            subset = [r for r in train if r.document == document]
            score = metrics([r.label for r in subset], [vote(r.flags, k) for r in subset])["balanced_accuracy"]
            if score is not None:
                values.append(score)
        if not values:
            raise ValueError("No training document contains both label classes")
        scores.append((sum(values) / len(values), k))
    best_score = max(x[0] for x in scores)
    best_k = min(k for score, k in scores if abs(score - best_score) <= 1e-12)
    return best_k, [{"k": k, "training_macro_balanced_accuracy": score} for score, k in scores]


def leave_one_document_out(records):
    predictions, folds = {}, []
    for document in sorted({r.document for r in records}):
        test = [r for r in records if r.document == document]
        test_keys = {normalized_reference(r.reference) for r in test}
        candidates = [r for r in records if r.document != document]
        train = [r for r in candidates if normalized_reference(r.reference) not in test_keys]
        if {r.uid for r in train} & {r.uid for r in test}:
            raise AssertionError("Training/test ID overlap")
        k, scores = select_threshold(train)
        held_predictions = [vote(r.flags, k) for r in test]
        predictions.update(zip((r.uid for r in test), held_predictions))
        folds.append(dict(held_out_document=document, threshold=k,
                          train_ids=[r.uid for r in train], test_ids=[r.uid for r in test],
                          excluded_duplicate_train_ids=[r.uid for r in candidates if r not in train],
                          training_scores=scores, test_metrics=metrics([r.label for r in test], held_predictions)))
    if set(predictions) != {r.uid for r in records}:
        raise AssertionError("Each reference must be held out exactly once")
    return [predictions[r.uid] for r in records], folds
