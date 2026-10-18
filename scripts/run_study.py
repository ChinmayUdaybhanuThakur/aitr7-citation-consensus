#!/usr/bin/env python3
"""Run the frozen, offline experiment; all reported values derive from saved rows."""
import argparse
import csv
from datetime import datetime, timezone
import hashlib
import json
import platform
from pathlib import Path
import statistics
import sys
import time
from collections import Counter, defaultdict
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from src.consensus import TOOLS, load_records, metrics, vote, triage, normalized_reference, leave_one_document_out


def dump_csv(path, rows):
    if not rows:
        path.write_text("")
        return
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader(); writer.writerows(rows)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_inputs(corrected=False):
    protocol = json.loads((ROOT/"configs/protocol.json").read_text())
    frozen = json.loads((ROOT/"provenance/protocol_freeze.json").read_text())
    if sha(ROOT/"configs/protocol.json") != frozen["sha256"]:
        raise ValueError("Frozen protocol was modified; document an amendment instead")
    manifest = json.loads((ROOT/"provenance"/("corrected_data_manifest.json" if corrected else "data_manifest.json")).read_text())
    raw = ROOT/"data"/("corrected" if corrected else "raw")
    for entry in manifest["files"]:
        if sha(raw/entry["name"]) != entry["sha256"]:
            raise ValueError("Dataset checksum mismatch: " + entry["name"])
    return protocol


def vector_metrics(y, p):
    tp = np.sum((y == 1) & (p == 1), axis=1)
    fn = np.sum((y == 1) & (p == 0), axis=1)
    fp = np.sum((y == 0) & (p == 1), axis=1)
    tn = np.sum((y == 0) & (p == 0), axis=1)
    recall = np.divide(tp, tp+fn, out=np.zeros_like(tp, dtype=float), where=(tp+fn)>0)
    fpr = np.divide(fp, fp+tn, out=np.zeros_like(tp, dtype=float), where=(fp+tn)>0)
    return {"balanced_accuracy": (recall+1-fpr)/2, "recall": recall, "false_positive_rate": fpr}


def bootstrap(records, a, b, protocol):
    config = protocol["bootstrap"]
    rng = np.random.default_rng(config["seed"])
    groups = [np.array([i for i,r in enumerate(records) if r.document == d])
              for d in sorted({r.document for r in records})]
    indices = np.concatenate([rng.choice(g, size=(config["replicates"], len(g)), replace=True) for g in groups], axis=1)
    y = np.array([r.label for r in records])[indices]
    av = vector_metrics(y, np.array(a)[indices]); bv = vector_metrics(y, np.array(b)[indices])
    rows = []
    for name in av:
        low, high = np.quantile(av[name]-bv[name], config["interval"])
        estimate = metrics([r.label for r in records], a)[name] - metrics([r.label for r in records], b)[name]
        rows.append(dict(metric=name, contrast="majority_k3_minus_refchecker", estimate=estimate,
                         lower=float(low), upper=float(high), replicates=config["replicates"], seed=config["seed"]))
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="results", help="Output directory relative to project root, or absolute")
    parser.add_argument("--corrected", action="store_true", help="Post-freeze robustness check on v1.1.0, amendment A2")
    args = parser.parse_args()
    out = ROOT/("results/corrected" if args.corrected and args.out=="results" else args.out)
    out.mkdir(parents=True, exist_ok=True)
    started = datetime.now(timezone.utc).isoformat(); tick = time.perf_counter()
    protocol = verify_inputs(args.corrected)
    dataset_path = ROOT/"data"/("corrected" if args.corrected else "raw")/"manual_reference_verification_dataset.csv"
    records = load_records(dataset_path)
    y = [r.label for r in records]
    expected_counts = (104,35,69) if args.corrected else (protocol["expected_rows"], protocol["expected_positive"], protocol["expected_negative"])
    if (len(records),sum(y),len(y)-sum(y)) != expected_counts:
        raise AssertionError("Dataset class counts differ from frozen protocol")
    documents = sorted({r.document for r in records})
    baselines = {tool: [r.flags[j] for r in records] for j,tool in enumerate(TOOLS)}
    methods = dict(baselines)
    methods.update({f"vote_k{k}": [vote(r.flags,k) for r in records] for k in range(1,6)})
    adaptive, folds = leave_one_document_out(records)
    methods["lodo_selected"] = adaptive
    for j,tool in enumerate(TOOLS):
        methods["without_"+tool] = [vote(r.flags[:j]+r.flags[j+1:],3) for r in records]
    summary = [{"method": method, **metrics(y,pred)} for method,pred in methods.items()]
    dump_csv(out/"metrics.csv", summary)
    (out/"metrics.json").write_text(json.dumps(summary, indent=2)+"\n")
    dump_csv(out/"by_document.csv", [{"document":d,"method":m,**metrics([r.label for r in records if r.document == d],
                         [pred[i] for i,r in enumerate(records) if r.document == d])} for d in documents for m,pred in methods.items()])
    per_reference = []
    for i,r in enumerate(records):
        row = dict(id=r.uid, document=r.document, true_problematic=r.label, votes=sum(r.flags),triage=triage(r.flags))
        row.update({tool:r.flags[j] for j,tool in enumerate(TOOLS)})
        row.update({m:pred[i] for m,pred in methods.items() if m not in TOOLS})
        row["reference"] = r.reference
        per_reference.append(row)
    dump_csv(out/"predictions.csv",per_reference)
    dump_csv(out/"vote_distribution.csv",[{"votes":v,"verified":sum(r.label==0 and sum(r.flags)==v for r in records),
                         "problematic":sum(r.label==1 and sum(r.flags)==v for r in records)} for v in range(6)])
    (out/"lodo_folds.json").write_text(json.dumps(folds,indent=2)+"\n")
    # Triage evaluates only automatic decisions; deferred items are never counted as successes.
    decisions = [triage(r.flags) for r in records]
    auto = [i for i,d in enumerate(decisions) if d != "review"]
    triage_result = {"total":len(records),"automatic_count":len(auto),"deferred_count":len(records)-len(auto),
                    "automatic_coverage":len(auto)/len(records),
                    "automatic_metrics":metrics([y[i] for i in auto],[int(decisions[i]=="auto_flag") for i in auto]) if auto else None,
                    "groups":[{"decision":d,"count":decisions.count(d),
                               "verified":sum(y[i]==0 and decisions[i]==d for i in range(len(y))),
                               "problematic":sum(y[i]==1 and decisions[i]==d for i in range(len(y)))}
                              for d in ["auto_accept","review","auto_flag"]]}
    (out/"triage.json").write_text(json.dumps(triage_result,indent=2)+"\n")
    dump_csv(out/"paired_bootstrap.csv",bootstrap(records,methods["vote_k3"],methods["refchecker"],protocol))
    errors = []
    for tool_a in TOOLS:
        for tool_b in TOOLS:
            ea = {i for i in range(len(y)) if methods[tool_a][i]!=y[i]}
            eb = {i for i in range(len(y)) if methods[tool_b][i]!=y[i]}
            union=ea|eb
            errors.append({"tool_a":tool_a,"tool_b":tool_b,"joint_errors":len(ea&eb),
                           "error_jaccard":len(ea&eb)/len(union) if union else 0.0})
    dump_csv(out/"error_overlap.csv",errors)
    failure_rows = []
    for row in per_reference:
        pred=row["vote_k3"];actual=row["true_problematic"]
        if pred != actual:
            failure_rows.append({"id":row["id"],"document":row["document"],"error":"false_positive" if pred else "false_negative",
              "votes":row["votes"],"flagging_tools":";".join(t for t in TOOLS if row[t]),
              "reference":row["reference"],"interpretation":"Mismatch with released manual label; bibliographic cause not independently adjudicated in this study."})
    dump_csv(out/"majority_errors.csv",failure_rows)
    keys=defaultdict(list)
    for r in records: keys[normalized_reference(r.reference)].append(r)
    duplicates=[{"ids":[r.uid for r in group],"documents":sorted({r.document for r in group}),
                 "labels": [r.label for r in group]} for group in keys.values() if len(group)>1]
    validation={"rows":len(records),"positive_problematic":sum(y),"negative_verified":len(y)-sum(y),
                "documents":{d:{"n":sum(r.document==d for r in records),"positive":sum(r.label for r in records if r.document==d)} for d in documents},
                "duplicate_groups":duplicates,"unique_normalized_references":len(keys),"missing_flags":0,
                "protocol_sha256":sha(ROOT/"configs/protocol.json"),"dataset_sha256":sha(dataset_path),
                "dataset_version":"1.1.0" if args.corrected else "1.0.0"}
    ref=metrics(y,baselines["refchecker"])
    expected={"tp":32,"fp":36,"tn":35,"fn":1}
    validation["published_refchecker_confusion"]={"expected_v1":expected,"observed":{k:ref[k] for k in expected},
                                                  "matches":all(ref[k]==v for k,v in expected.items()),
                                                  "applies_to_this_version":not args.corrected}
    (out/"validation.json").write_text(json.dumps(validation,indent=2)+"\n")
    if not args.corrected and not validation["published_refchecker_confusion"]["matches"]:
        raise AssertionError("Published RefChecker confusion matrix not reproduced; inspect before interpretation")
    main_m=metrics(y,methods["vote_k3"])
    decision={"fpr_reduction":ref["false_positive_rate"]-main_m["false_positive_rate"],"majority_recall":main_m["recall"],
              "meets_prespecified_rule":ref["false_positive_rate"]-main_m["false_positive_rate"]>=0.10 and main_m["recall"]>=0.80}
    (out/"primary_decision.json").write_text(json.dumps(decision,indent=2)+"\n")
    timings=[]
    for _ in range(protocol["runtime_repeats"]):
        start=time.perf_counter()
        for r in records: vote(r.flags,3)
        timings.append((time.perf_counter()-start)*1000)
    run={"started_at_utc":started,"finished_at_utc":datetime.now(timezone.utc).isoformat(),
         "wall_seconds":time.perf_counter()-tick,"python":sys.version,"platform":platform.platform(),"numpy":np.__version__,
         "command":"python scripts/run_study.py"+(" --corrected" if args.corrected else "")+(" --out "+args.out if args.out!="results" else ""),
         "dataset_version":"1.1.0" if args.corrected else "1.0.0",
         "majority_104_rows_ms":timings,"median_majority_ms":statistics.median(timings),
         "timing_scope":"Only post-processing saved flags; original tool runtime and network costs are not measured.",
         "source_hashes":{str(p.relative_to(ROOT)):sha(p) for p in sorted((ROOT/"src").glob('*.py'))},
         "runner_sha256":sha(Path(__file__))}
    (out/"run_manifest.json").write_text(json.dumps(run,indent=2)+"\n")
    print("DATA VALIDATED:",len(records),"references;",sum(y),"problematic;",len(y)-sum(y),"verified")
    print("CORRECTED-LABEL BASELINE:" if args.corrected else "PUBLISHED BASELINE REPRODUCED:",validation["published_refchecker_confusion"]["observed"])
    print("method                 TP FP TN FN   recall   FPR     balanced_accuracy")
    for m in summary[:11]: print(f"{m['method']:<22} {m['tp']:2} {m['fp']:2} {m['tn']:2} {m['fn']:2}   {m['recall']:.3f}    {m['false_positive_rate']:.3f}   {m['balanced_accuracy']:.3f}")
    print("PRIMARY SUCCESS RULE:",decision)
    print("LODO THRESHOLDS:",[(f['held_out_document'],f['threshold']) for f in folds])
    print("SAVED:",out)


if __name__=="__main__":main()
