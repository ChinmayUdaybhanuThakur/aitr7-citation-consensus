#!/usr/bin/env python3
"""Demonstrate the consensus rule on five observed flags, without a truth label."""
import argparse
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from src.consensus import vote,triage
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--flags',nargs=5,type=int,required=True,metavar='0_OR_1')
p.add_argument('--threshold',type=int,default=3)
a=p.parse_args()
print({'votes':sum(a.flags),'flag_for_review':bool(vote(a.flags,a.threshold)),'triage':triage(a.flags),
       'scope':'Aggregates supplied checker outputs; does not establish bibliographic truth.'})
