#!/usr/bin/env python3
"""Validate author-reported label corrections and retain text encoding differences."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from src.consensus import load_records,TOOLS
old=load_records(ROOT/'data/raw/manual_reference_verification_dataset.csv')
new=load_records(ROOT/'data/corrected/manual_reference_verification_dataset.csv')
assert len(old)==len(new)==104
changes=[];text_changes=[]
for a,b in zip(old,new):
 assert (a.uid,a.document,a.flags)==(b.uid,b.document,b.flags)
 if a.reference!=b.reference:text_changes.append({'id':a.uid,'old':a.reference,'new':b.reference})
 if a.label!=b.label:changes.append({'id':a.uid,'old_label':a.label,'new_label':b.label,'votes':sum(b.flags),'flags':dict(zip(TOOLS,b.flags))})
assert {x['id'] for x in changes}=={'P3:R12','P3:R18'}
assert all(x['old_label']==0 and x['new_label']==1 for x in changes)
report={'ids_and_flags_unchanged':True,'label_changes':changes,'reference_text_encoding_differences':text_changes}
(ROOT/'provenance/label_correction_audit.json').write_text(json.dumps(report,indent=2)+'\n')
print('104 IDs and 520 flags unchanged; two label corrections; '+str(len(text_changes))+' text encoding differences.')
