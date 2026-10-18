#!/usr/bin/env python3
"""Small executable environment check; no GPU or network access needed."""
import sys,platform,json,importlib.metadata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from src.consensus import load_records,vote,metrics
info={'python':sys.version,'platform':platform.platform(),'machine':platform.machine(),
      'packages':{k:importlib.metadata.version(k) for k in ['numpy','matplotlib']}}
for version in ['raw','corrected']:
 rows=load_records(ROOT/'data'/version/'manual_reference_verification_dataset.csv')
 info[version]={'rows':len(rows),'problematic':sum(r.label for r in rows),'documents':sorted({r.document for r in rows})}
assert vote((1,1,1,0,0),3)==1
assert metrics([1,0],[1,0])['balanced_accuracy']==1
print(json.dumps(info,indent=2))
