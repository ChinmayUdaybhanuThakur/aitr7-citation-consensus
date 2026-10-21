#!/usr/bin/env python3
"""Readable, file-derived evidence used in the recorded execution walkthrough."""
import argparse
import csv
import inspect
import json
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from src.consensus import load_records, vote, triage
p=argparse.ArgumentParser();p.add_argument('section',choices=['data','code','results','baseline','limits','files']);a=p.parse_args()
if a.section=='data':
    for version,folder in [('original','raw'),('corrected','corrected')]:
        rows=load_records(ROOT/'data'/folder/'manual_reference_verification_dataset.csv')
        print(f'{version}: {len(rows)} references, {sum(r.label for r in rows)} problematic')
    row=rows[0]
    print('\nOne actual row:',row.uid)
    print('Reference:',row.reference)
    print('Recorded flags:',row.flags,'Ground truth:',row.label)
    print('k=3:',vote(row.flags,3),'k=4:',vote(row.flags,4),'triage:',triage(row.flags))
elif a.section=='code':
    print(inspect.getsource(vote));print(inspect.getsource(triage))
elif a.section=='results':
    with (ROOT/'results/corrected/metrics.csv').open() as f:rows=list(csv.DictReader(f))
    print('METHOD             TP FP TN FN  RECALL    FPR     BA')
    for r in rows:
        if r['method'] in ['refchecker','vote_k3','vote_k4','lodo_selected']:
            print(f"{r['method']:18} {int(r['tp']):2} {int(r['fp']):2} {int(r['tn']):2} {int(r['fn']):2}  {float(r['recall']):.3f}   {float(r['false_positive_rate']):.3f}   {float(r['balanced_accuracy']):.3f}")
    print('\nPrimary decision:',json.loads((ROOT/'results/corrected/primary_decision.json').read_text()))
    t=json.loads((ROOT/'results/corrected/triage.json').read_text())
    print('Triage:',t['automatic_count'],'automatic;',t['deferred_count'],'deferred')
elif a.section=='baseline':
    for name in ['crossref_baseline','live_baseline']:
        x=json.loads((ROOT/'results'/name/'summary.json').read_text())
        print(name,':',x['complete_rows'],'complete of',x['total_rows'])
        print('Measured complete-row counts:',{k:x['complete_row_metrics'][k] for k in ['tp','fp','tn','fn']})
    for name in ['crossref_baseline','live_baseline']:
        same=(ROOT/'results'/name/'predictions.json').read_bytes()==(ROOT/'results'/(name+'_replay')/'predictions.json').read_bytes()
        print(name,'cached algorithm replay identical:',same)
        assert same
    print('Original source:',json.loads((ROOT/'third_party/checkifexist/UPSTREAM.json').read_text())['commit'])
elif a.section=='limits':
    folds=json.loads((ROOT/'results/corrected/lodo_folds.json').read_text())
    print('Held-out thresholds:',[(f['held_out_document'],f['threshold']) for f in folds])
    print('Three source documents; inherited manual labels; no human-trust experiment.')
    print('The 81 incomplete cascade cases are not treated as validated predictions.')
    print('The additional baseline run does not change the frozen consensus study.')
else:
    for file in ['paper/main.pdf','baseline_validation.md','ai_assistance_log.md','docs/authentic_prompt_record.md','provenance/ai_traceability.json','configs/protocol.json','configs/live_baseline_protocol.json','configs/crossref_baseline_protocol.json']:
        print(('OK ' if (ROOT/file).is_file() else 'MISSING ')+file)
    print('Student explanation, rerun and honest personal reflection remain personal.')
